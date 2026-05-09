import { useEffect, useRef, useState } from "react";

export function MapLocationPicker({
  apiKey,
  onLocationSelect,
  initialLatitude,
  initialLongitude,
  height = "300px",
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Initialize map
  useEffect(() => {
    if (!apiKey || !window.google) {
      setError("Google Maps API key not configured");
      return;
    }

    const initMap = () => {
      try {
        const defaultCenter = {
          lat: initialLatitude ? Number(initialLatitude) : 20.5937,
          lng: initialLongitude ? Number(initialLongitude) : 78.9629,
        };

        const mapOptions = {
          center: defaultCenter,
          zoom: initialLatitude && initialLongitude ? 15 : 5,
          styles: [
            {
              featureType: "all",
              elementType: "geometry.fill",
              stylers: [{ weight: "2.5" }],
            },
            {
              featureType: "all",
              elementType: "geometry.stroke",
              stylers: [{ color: "#9c9c9c" }],
            },
            {
              featureType: "all",
              elementType: "labels.text",
              stylers: [{ visibility: "on" }],
            },
            {
              featureType: "water",
              elementType: "all",
              stylers: [{ color: "#46bcec" }],
            },
          ],
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        };

        const map = new window.google.maps.Map(mapRef.current, mapOptions);
        mapInstanceRef.current = map;

        // Add marker if initial coordinates exist
        if (initialLatitude && initialLongitude) {
          const position = {
            lat: Number(initialLatitude),
            lng: Number(initialLongitude),
          };
          const marker = new window.google.maps.Marker({
            position,
            map,
            draggable: true,
            animation: window.google.maps.Animation.DROP,
          });
          markerRef.current = marker;

          // Reverse geocode to get address
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: position }, (results, status) => {
            if (status === "OK" && results[0]) {
              onLocationSelect({
                latitude: position.lat,
                longitude: position.lng,
                address: results[0].formatted_address,
              });
            }
          });

          // Update on marker drag
          marker.addListener("dragend", () => {
            const newPos = marker.getPosition();
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: newPos }, (results, status) => {
              const address = status === "OK" && results[0] ? results[0].formatted_address : "";
              onLocationSelect({
                latitude: newPos.lat(),
                longitude: newPos.lng(),
                address,
              });
            });
          });
        }

        // Handle map click
        map.addListener("click", (event) => {
          const clickedPos = event.latLng;
          const lat = clickedPos.lat();
          const lng = clickedPos.lng();

          // Update or create marker
          if (markerRef.current) {
            markerRef.current.setPosition(clickedPos);
          } else {
            const marker = new window.google.maps.Marker({
              position: clickedPos,
              map,
              draggable: true,
              animation: window.google.maps.Animation.DROP,
            });
            markerRef.current = marker;

            marker.addListener("dragend", () => {
              const newPos = marker.getPosition();
              const geocoder = new window.google.maps.Geocoder();
              geocoder.geocode({ location: newPos }, (results, status) => {
                const address = status === "OK" && results[0] ? results[0].formatted_address : "";
                onLocationSelect({
                  latitude: newPos.lat(),
                  longitude: newPos.lng(),
                  address,
                });
              });
            });
          }

          // Reverse geocode
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: clickedPos }, (results, status) => {
            const address = status === "OK" && results[0] ? results[0].formatted_address : "";
            onLocationSelect({
              latitude: lat,
              longitude: lng,
              address,
            });
          });
        });

        setMapLoaded(true);
      } catch (err) {
        console.error("Error initializing map:", err);
        setError("Failed to load map");
      }
    };

    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps) {
      initMap();
    } else {
      // Load Google Maps API
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      window.initMap = initMap;
      script.onerror = () => setError("Failed to load Google Maps");
      document.head.appendChild(script);
    }

    return () => {
      if (mapInstanceRef.current) {
        window.google?.maps.event?.clearInstanceListeners(mapInstanceRef.current);
      }
    };
  }, [apiKey, initialLatitude, initialLongitude, onLocationSelect]);

  if (error) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center rounded-xl border border-red-200 bg-red-50"
      >
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={mapRef}
        style={{ height, width: "100%" }}
        className="rounded-xl border border-slate-200"
      />
      {!mapLoaded && (
        <div
          style={{ height }}
          className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-100"
        >
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
            Loading map...
          </div>
        </div>
      )}
      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        Click on the map to set your service location
      </div>
    </div>
  );
}

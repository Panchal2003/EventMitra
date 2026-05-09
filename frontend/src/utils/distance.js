/**
 * Distance calculation utilities
 * Uses Haversine formula to calculate distance between two geographic points
 */

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const numLat1 = Number(lat1);
  const numLon1 = Number(lon1);
  const numLat2 = Number(lat2);
  const numLon2 = Number(lon2);

  if (isNaN(numLat1) || isNaN(numLon1) || isNaN(numLat2) || isNaN(numLon2) ||
      numLat1 === null || numLon1 === null || numLat2 === null || numLon2 === null) {
    return null;
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const rLat1 = toRad(lat1);
  const rLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(rLat1) * Math.cos(rLat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 * @param {number} deg - Degrees
 * @returns {number} Radians
 */
function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Filter providers by distance from user's location
 * @param {Array} providers - Array of provider objects with service location data
 * @param {number} userLat - User's latitude
 * @param {number} userLon - User's longitude
 * @param {number} maxDistanceKm - Maximum distance in kilometers (default: 10)
 * @returns {Array} Filtered array of providers within distance, with distance property added
 */
export function filterProvidersByDistance(providers, userLat, userLon, maxDistanceKm = 10) {
  if (!userLat || !userLon) {
    return providers.map(provider => ({
      ...provider,
      distance: null,
    }));
  }

  return providers
    .map(provider => {
      // Get location from the provider's first service
      // Location stored as GeoJSON: { type: "Point", coordinates: [longitude, latitude], address: "" }
      const service = provider.services?.[0];
      const location = service?.location;
      
      let lat, lon;
      if (location) {
        if (Array.isArray(location.coordinates)) {
          // GeoJSON format: [longitude, latitude]
          lon = location.coordinates[0];
          lat = location.coordinates[1];
        } else {
          // Legacy format (if any): { latitude, longitude }
          lat = location.latitude;
          lon = location.longitude;
        }
      }

      const distance = calculateDistance(userLat, userLon, lat, lon);
      return {
        ...provider,
        distance,
      };
    })
    .filter(provider => {
      if (provider.distance === null) return true; // Include if no location data
      return provider.distance <= maxDistanceKm;
    })
    .sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
}

/**
 * Format distance for display
 * @param {number} distanceKm - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export function formatDistance(distanceKm) {
  if (distanceKm === null || distanceKm === undefined) {
    return "Location unknown";
  }
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m away`;
  }
  return `${distanceKm.toFixed(1)}km away`;
}

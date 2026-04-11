import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Image, 
  Trash2, 
  Plus, 
  Loader2,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { adminApi, publicApi } from "../../services/api";

const categories = [
  "All",
  "Wedding",
  "Decoration",
  "Birthday",
  "Corporate",
  "Entertainment",
  "Makeup",
  "Catering",
  "Venue",
  "Stationery",
  "Mehndi",
  "General",
];

export function AdminGalleryPage() {
  const [galleryImages, setGalleryImages] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [adding, setAdding] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [notice, setNotice] = useState(null);
  const [noticeType, setNoticeType] = useState("success");

  useEffect(() => {
    fetchGallery();
    fetchServices();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getGallery();
      if (response.data?.data) {
        setGalleryImages(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      const response = await publicApi.getServices();
      if (response.data?.data) {
        setServices(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setServicesLoading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!confirm("Are you sure you want to delete this image from gallery?")) return;
    
    try {
      setDeleting(imageId);
      await adminApi.deleteGalleryImage(imageId);
      setGalleryImages(prev => prev.filter(img => img._id !== imageId));
      showNotice("Image deleted successfully", "success");
    } catch (error) {
      showNotice(error.response?.data?.message || "Failed to delete image", "error");
    } finally {
      setDeleting(null);
    }
  };

  const handleAddFromService = async () => {
    if (!selectedService) {
      showNotice("Please select a service", "error");
      return;
    }

    try {
      setAdding(true);
      
      const serviceImages = selectedService.images || [];
      const mainImage = selectedService.image;
      
      if (serviceImages.length === 0 && !mainImage) {
        showNotice("No images found in this service", "error");
        return;
      }

      const allImages = [
        ...(mainImage ? [{ url: mainImage, alt: selectedService.name }] : []),
        ...serviceImages.map((url, idx) => ({ url, alt: `${selectedService.name} - Image ${idx + 1}` }))
      ];

      for (const img of allImages) {
        await adminApi.addGalleryImage({
          imageUrl: img.url,
          alt: img.alt,
          category: selectedService.category?.name || "General",
          serviceName: selectedService.name || "",
          sourceServiceId: selectedService._id,
          sourceProviderId: selectedService.createdBy?._id
        });
      }

      setShowAddModal(false);
      setSelectedService(null);
      fetchGallery();
      showNotice(`Added ${allImages.length} image(s) to gallery`, "success");
    } catch (error) {
      showNotice(error.response?.data?.message || "Failed to add images", "error");
    } finally {
      setAdding(false);
    }
  };

  const showNotice = (message, type = "success") => {
    setNotice(message);
    setNoticeType(type);
    setTimeout(() => setNotice(null), 3000);
  };

  const serviceOptions = services.filter(s => s.images?.length || s.image);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-3 sm:p-4 lg:p-6">
      {/* Notice */}
      {notice && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl px-4 py-3 shadow-lg max-w-[90vw] ${
            noticeType === "success" 
              ? "bg-emerald-500 text-white" 
              : "bg-red-500 text-white"
          }`}
        >
          {noticeType === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span className="text-sm font-semibold truncate">{notice}</span>
        </motion.div>
      )}

      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">Gallery Management</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 hidden sm:block">
              Manage gallery images - add from services or remove unwanted ones
            </p>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Images
          </Button>
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 sm:py-20">
          <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary-600" />
        </div>
      ) : galleryImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center px-4">
          <Image className="h-12 w-12 sm:h-16 sm:w-16 text-slate-300 mb-3 sm:mb-4" />
          <p className="text-base sm:text-lg font-semibold text-slate-700">No gallery images yet</p>
          <p className="text-sm text-slate-500 mt-1">Add images from provider services</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
          {galleryImages.map((image) => (
            <div
              key={image._id}
              className="relative group rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm"
            >
              <div className="aspect-square">
                <img
                  src={image.imageUrl}
                  alt={image.alt}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-2 sm:p-3">
                <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">{image.alt}</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{image.category}</p>
              </div>
              <button
                onClick={() => handleDelete(image._id)}
                disabled={deleting === image._id}
                className="absolute top-2 right-2 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-600 disabled:opacity-50"
              >
                {deleting === image._id ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedService(null);
        }}
        title="Add Images to Gallery"
        description="Select a service to add its images to the gallery"
        className="max-w-lg"
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 p-3 border border-violet-100">
            <p className="text-xs font-medium text-violet-700">
              💡 Tip: Select a service to add all its images to the public gallery
            </p>
          </div>
          
          {servicesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : serviceOptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                <Image className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-700 font-medium">No services with images found</p>
              <p className="text-sm text-slate-500 mt-1">Providers haven't uploaded any images yet</p>
            </div>
          ) : (
            <div className="max-h-[50vh] sm:max-h-[400px] overflow-y-auto space-y-2 pr-1">
              {serviceOptions.map((service, index) => {
                const imageCount = (service.images?.length || 0) + (service.image ? 1 : 0);
                if (imageCount === 0) return null;
                
                const gradients = [
                  "from-pink-500 to-rose-500",
                  "from-violet-500 to-purple-500", 
                  "from-blue-500 to-cyan-500",
                  "from-emerald-500 to-teal-500",
                  "from-amber-500 to-orange-500",
                  "from-indigo-500 to-blue-500",
                ];
                const gradient = gradients[index % gradients.length];
                
                return (
                  <button
                    key={service._id}
                    onClick={() => setSelectedService(service)}
                    className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl border-2 text-left transition hover:shadow-md ${
                      selectedService?._id === service._id
                        ? "border-purple-500 bg-purple-50 shadow-sm"
                        : "border-slate-200 hover:border-purple-300 hover:bg-slate-50"
                    }`}
                  >
                    <img
                      src={service.image || service.images?.[0]}
                      alt={service.name}
                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">{service.name}</p>
                      <p className="text-xs text-slate-500">{imageCount} image(s)</p>
                    </div>
                    {selectedService?._id === service._id && (
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddModal(false);
                setSelectedService(null);
              }}
              className="flex-1 text-sm py-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddFromService}
              disabled={!selectedService || adding}
              className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
            >
              {adding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Images
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
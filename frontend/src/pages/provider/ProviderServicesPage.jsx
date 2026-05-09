import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useUI } from "../../context/UIContext";
import {
  Plus,
  Package,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Loader2,
  Upload,
  Sparkles,
  Award,
  MapPin,
  Video,
} from "lucide-react";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { providerApi } from "../../services/api";
import { formatCurrency } from "../../utils/currency";

const statCardThemes = [
  {
    glow: "bg-gradient-to-br from-cyan-500/20 via-sky-500/10 to-blue-500/20",
    border: "border-cyan-100/80",
    background: "bg-gradient-to-br from-cyan-100 via-sky-50 to-blue-100/90",
    icon: "bg-gradient-to-br from-cyan-500 to-blue-600",
  },
  {
    glow: "bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/20",
    border: "border-emerald-100/80",
    background: "bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100/90",
    icon: "bg-gradient-to-br from-emerald-500 to-teal-600",
  },
  {
    glow: "bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-purple-500/20",
    border: "border-violet-100/80",
    background: "bg-gradient-to-br from-violet-100 via-fuchsia-50 to-purple-100/90",
    icon: "bg-gradient-to-br from-violet-500 to-fuchsia-600",
  },
  {
    glow: "bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-yellow-500/20",
    border: "border-amber-100/80",
    background: "bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100/90",
    icon: "bg-gradient-to-br from-amber-500 to-orange-600",
  },
];

const createInitialServiceForm = () => ({
  name: "",
  category: "",
  description: "",
  price: "",
  status: "active",
  images: [],
  videos: [],
  allowsMembers: false,
  pricePerMember: "",
  location: {
    address: "",
    latitude: "",
    longitude: "",
  },
});

export function ProviderServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [notice, setNotice] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const { hideBottomNav, showBottomNav } = useUI();
  
  const handleSearchFocus = () => hideBottomNav();
  const handleSearchBlur = () => showBottomNav();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [servicesRes, categoriesRes] = await Promise.all([
        providerApi.getServices(),
        providerApi.getServiceCategories()
      ]);
      
      if (servicesRes.data?.success) {
        setServices(servicesRes.data.data);
      }
      if (categoriesRes.data?.success) {
        setCategories(categoriesRes.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setError(err.response?.data?.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [formData, setFormData] = useState(createInitialServiceForm());
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const existingPreviewCount = (imagePreviews.length > 0 ? imagePreviews : formData.images).length;

    if (existingPreviewCount + files.length > 15) {
      setNotice({ type: "error", message: "Please keep between 5 and 15 images in the gallery." });
      return;
    }

    if (files.length > 0) {
      const previewUrls = files.map(file => URL.createObjectURL(file));
      setImagePreviews((previous) => [...previous, ...previewUrls]);
      uploadImages(files);
    }

    e.target.value = "";
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    const existingPreviewCount = (videoPreviews.length > 0 ? videoPreviews : formData.videos || []).length;

    if (existingPreviewCount + files.length > 5) {
      setNotice({ type: "error", message: "Please keep maximum 5 videos." });
      return;
    }

    if (files.length > 0) {
      const previewUrls = files.map(file => URL.createObjectURL(file));
      setVideoPreviews((previous) => [...previous, ...previewUrls]);
      uploadVideos(files);
    }

    e.target.value = "";
  };

  const uploadImages = async (files) => {
    setUploadingImage(true);
    try {
      const formDataImg = new FormData();
      files.forEach(file => {
        formDataImg.append("images", file);
      });

      const response = await providerApi.uploadMultipleImages(formDataImg);
      if (response.data?.success) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...response.data.data.images].slice(0, 15),
        }));
        setNotice({ type: "success", message: "Images uploaded successfully!" });
      }
    } catch (err) {
      console.error("Failed to upload images:", err);
      setNotice({ type: "error", message: "Failed to upload images" });
    } finally {
      setUploadingImage(false);
    }
  };

  const uploadVideos = async (files) => {
    setUploadingVideo(true);
    try {
      const formDataVid = new FormData();
      files.forEach(file => {
        formDataVid.append("videos", file);
      });

      const response = await providerApi.uploadVideos(formDataVid);
      if (response.data?.success) {
        setFormData((prev) => ({
          ...prev,
          videos: [...(prev.videos || []), ...response.data.data.videos].slice(0, 5),
        }));
        setNotice({ type: "success", message: "Videos uploaded successfully!" });
      }
    } catch (err) {
      console.error("Failed to upload videos:", err);
      setNotice({ type: "error", message: "Failed to upload videos" });
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingService && (formData.images.length < 5 || formData.images.length > 15)) {
      setNotice({ type: "error", message: "Please upload between 5 and 15 service images before adding the service." });
      return;
    }

    setActionLoading(true);
    
    try {
      const payload = {
        ...formData,
        startingPrice: Number(formData.price),
        pricePerMember: formData.allowsMembers ? Number(formData.pricePerMember) : 0,
        location: {
          type: "Point",
          coordinates: formData.location.latitude && formData.location.longitude && !isNaN(parseFloat(formData.location.latitude)) && !isNaN(parseFloat(formData.location.longitude)) ? [
            parseFloat(formData.location.longitude),
            parseFloat(formData.location.latitude)
          ] : undefined,
          address: formData.location.address || ""
        }
      };
      
      if (editingService) {
        await providerApi.updateService(editingService._id, payload);
        setNotice({ type: "success", message: "Service updated successfully!" });
      } else {
        await providerApi.createService(payload);
        setNotice({ type: "success", message: "Service added successfully!" });
      }
      
      setFormData(createInitialServiceForm());
      setImagePreviews([]);
      setShowAddForm(false);
      setEditingService(null);
      await fetchData();
    } catch (err) {
      console.error("Failed to save service:", err);
      setNotice({ type: "error", message: err.response?.data?.message || "Failed to save service" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category?._id || service.category,
      description: service.description,
      price: String(service.startingPrice),
      status: service.status,
      images: service.images || [],
      allowsMembers: service.allowsMembers || false,
      pricePerMember: service.pricePerMember ? String(service.pricePerMember) : "",
      location: {
        address: service.location?.address || "",
        latitude: service.location?.coordinates?.[1] ? String(service.location.coordinates[1]) : "",
        longitude: service.location?.coordinates?.[0] ? String(service.location.coordinates[0]) : "",
      },
    });
    setImagePreviews(service.images || []);
    setShowAddForm(true);
  };

  const closeServiceForm = () => {
    setShowAddForm(false);
    setEditingService(null);
    setFormData(createInitialServiceForm());
    setImagePreviews([]);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this service?")) {
      setActionLoading(true);
      try {
        await providerApi.deleteService(id);
        setNotice({ type: "success", message: "Service deleted successfully!" });
        await fetchData();
      } catch (err) {
        setNotice({ type: "error", message: err.response?.data?.message || "Failed to delete service" });
      } finally {
        setActionLoading(false);
      }
    }
  };

  const toggleStatus = async (service) => {
    const newStatus = service.status === "active" ? "archived" : "active";
    setActionLoading(true);
    try {
      await providerApi.updateService(service._id, { status: newStatus });
      setNotice({ type: "success", message: `Service ${newStatus === "active" ? "activated" : "archived"} successfully!` });
      await fetchData();
    } catch (err) {
      setNotice({ type: "error", message: err.response?.data?.message || "Failed to update service" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      setNotice({ type: "error", message: "Category name is required" });
      return;
    }
    setCategoryLoading(true);
    try {
      await providerApi.createServiceCategory({ name: newCategoryName.trim() });
      setNotice({ type: "success", message: "Category created successfully!" });
      setNewCategoryName("");
      setShowCategoryModal(false);
      await fetchData();
    } catch (err) {
      setNotice({ type: "error", message: err.response?.data?.message || "Failed to create category" });
    } finally {
      setCategoryLoading(false);
    }
  };

  // Filter services based on search
  const filteredServices = services.filter(service => 
    service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const totalServices = services.length;
  const activeServices = services.filter(s => s.status === "active").length;
  const totalBookings = services.reduce((sum, s) => sum + (s.bookings || 0), 0);
  const completedBookings = services.reduce((sum, s) => sum + (s.completedBookings || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="space-y-6 px-4 pb-8 pt-4 sm:px-6 lg:px-8 sm:pb-6">
        {/* Hero Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[28px] border border-sky-100/80 bg-[radial-gradient(circle_at_top_right,rgba(191,219,254,0.45),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(239,246,255,0.95)_50%,rgba(245,251,255,0.98))] p-6 shadow-[0_24px_80px_rgba(148,163,184,0.18)] sm:p-8"
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 h-[240px] w-[240px] rounded-full bg-sky-200/70 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 h-[220px] w-[220px] rounded-full bg-cyan-100/80 blur-3xl"></div>
          </div>
          <div className="absolute inset-0 opacity-[0.05]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.7)_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/85 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 shadow-sm shadow-sky-100"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Service Management
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-3 font-display text-2xl font-bold leading-tight text-slate-950 sm:text-3xl lg:text-4xl"
                >
                  Present your services
                  <br />
                  <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    with more clarity
                  </span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base"
                >
                  Keep your service list updated, maintain a stronger gallery, and make pricing easier for clients to understand before they book.
                </motion.p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notice */}
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 ${
              notice.type === "success" ? "bg-blue-50 text-blue-800" : "bg-red-50 text-red-800"
            }`}
          >
            {notice.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            {notice.message}
            <button onClick={() => setNotice(null)} className="ml-auto text-current opacity-60 hover:opacity-100">
              <XCircle className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        )}

        {/* Stats Cards */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {[
              { label: "Total Services", value: totalServices, icon: Package },
              { label: "Active Services", value: activeServices, icon: CheckCircle2 },
              { label: "Completed Bookings", value: completedBookings, icon: Award },
              { label: "Categories", value: categories.length, icon: Sparkles },
            ].map((stat, index) => (
              <div key={stat.label} className="group relative">
                <div className={`absolute inset-0 rounded-xl opacity-0 blur-xl transition-all duration-500 group-hover:opacity-100 group-hover:blur-2xl ${statCardThemes[index].glow}`} />
                <div className={`relative flex min-h-[140px] flex-col items-center justify-center rounded-2xl border p-4 text-center shadow-lg shadow-slate-200/20 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-xl ${statCardThemes[index].border}`}>
                  <div className={`absolute inset-0 rounded-2xl ${statCardThemes[index].background}`} />
                  <div className={`relative mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110 ${statCardThemes[index].icon}`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="relative mb-1 text-2xl font-display font-extrabold text-slate-900 sm:text-3xl">{stat.value}</p>
                  <p className="relative flex min-h-[2.5rem] items-center text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        <Modal
          open={showAddForm}
          onClose={closeServiceForm}
          title={editingService ? "Edit Service" : "Add New Service"}
          description="Manage your service details, work gallery, pricing, and booking rules from this popup."
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Service Images
                </label>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {(imagePreviews.length > 0 ? imagePreviews : formData.images).length}/5 uploaded
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  {(imagePreviews.length > 0 ? imagePreviews : formData.images).map((img, index) => (
                    <div key={index} className="relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200">
                      <img
                        src={img}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = formData.images.filter((_, i) => i !== index);
                          const newPreviews = imagePreviews.filter((_, i) => i !== index);
                          setFormData((prev) => ({ ...prev, images: newImages }));
                          setImagePreviews(newPreviews);
                        }}
                        className="absolute right-0 top-0 rounded-bl-lg bg-red-500 p-1 text-xs text-white"
                      >
                        x
                      </button>
                    </div>
                  ))}
                  {(imagePreviews.length > 0 ? imagePreviews : formData.images).length < 15 ? (
                    <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-blue-300 hover:bg-blue-50">
                      <Upload className="h-6 w-6 text-slate-400" />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  ) : null}
                </div>
                {uploadingImage ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading images...
                  </div>
                ) : null}
                <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-2.5 text-xs text-blue-800">
                  Add 5-15 strong work photos here. Customers will see this gallery before booking, so better images can improve trust and conversions.
                </div>
                <p className="text-xs text-slate-500">
                  PNG, JPG up to 5MB each.
                </p>

                {/* Video Upload Section */}
                <div className="mt-4">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Service Videos (optional)</p>
                  <div className="flex flex-wrap gap-3">
                    {(videoPreviews.length > 0 ? videoPreviews : formData.videos || []).map((vid, index) => (
                      <div key={`vid-${index}`} className="relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <video
                          src={vid}
                          className="h-full w-full object-cover"
                          muted
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newVideos = (formData.videos || []).filter((_, i) => i !== index);
                            const newPreviews = videoPreviews.filter((_, i) => i !== index);
                            setFormData((prev) => ({ ...prev, videos: newVideos }));
                            setVideoPreviews(newPreviews);
                          }}
                          className="absolute right-0 top-0 rounded-bl-lg bg-red-500 p-1 text-xs text-white"
                        >
                          x
                        </button>
                      </div>
                    ))}
                    {(videoPreviews.length > 0 ? videoPreviews : formData.videos || []).length < 5 ? (
                      <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-blue-300 hover:bg-blue-50">
                        <Video className="h-6 w-6 text-slate-400" />
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime"
                          multiple
                          onChange={handleVideoChange}
                          className="hidden"
                          disabled={uploadingVideo}
                        />
                      </label>
                    ) : null}
                  </div>
                  {uploadingVideo ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading videos...
                    </div>
                  ) : null}
                  <p className="text-xs text-slate-500 mt-1">
                    MP4, WebM, MOV up to 50MB each. Maximum 5 videos.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Service Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Wedding Photography"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                placeholder="Describe your service..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Starting Price (Rs)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="50000"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {editingService ? (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">Allow Member-Based Pricing</p>
                  <p className="text-sm text-slate-500">Enable this to charge per member/guest</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    name="allowsMembers"
                    checked={formData.allowsMembers}
                    onChange={(e) => setFormData({ ...formData, allowsMembers: e.target.checked })}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:translate-x-1 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-6"></div>
                </label>
              </div>
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs text-amber-800">
                  <span className="font-semibold">Important:</span> Your final earnings will be calculated after deducting 11% platform fee and any owner/partner profit share. Please set your prices keeping these deductions in mind to maintain your desired profit margin.
                </p>
              </div>
              {formData.allowsMembers ? (
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Price Per Member (Rs)
                  </label>
                  <input
                    type="number"
                    name="pricePerMember"
                    value={formData.pricePerMember}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="e.g., 500 per person"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Base price: Rs {formData.price || 0} + (Rs {formData.pricePerMember || 0} x number of members)
                  </p>
                </div>
              ) : null}
            </div>

            {/* Location Section */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary-600" />
                <h3 className="text-sm font-semibold text-slate-900">Service Location</h3>
              </div>
              <p className="mb-4 text-xs text-slate-500">
                Set the location where you provide this service. Customers will see providers within 10km of their location.
              </p>

              {/* Google Maps Button */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => window.open('https://www.google.com/maps', '_blank')}
                  className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-100"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Open Google Maps to find your location
                </button>
                <p className="mt-2 text-xs text-slate-500">
                  After opening Google Maps, search your location, right-click on the pin → "Copy coordinates" → paste below.
                </p>
              </div>

              {/* Manual Input Fields */}
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Address / Area
                  </label>
                  <input
                    type="text"
                    name="locationAddress"
                    value={formData.location?.address || ""}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, address: e.target.value }
                    }))}
                    placeholder="e.g., MG Road, Bangalore"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="-90"
                      max="90"
                      name="locationLatitude"
                      value={formData.location?.latitude || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        location: { ...prev.location, latitude: e.target.value }
                      }))}
                      placeholder="e.g., 12.9716"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="-180"
                      max="180"
                      name="locationLongitude"
                      value={formData.location?.longitude || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        location: { ...prev.location, longitude: e.target.value }
                      }))}
                      placeholder="e.g., 77.5946"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                  <p className="text-xs text-amber-800">
                    <span className="font-semibold">How to get coordinates:</span> Click "Open Google Maps" button above, find your location, right-click on the map pin → "Copy coordinates" (format: 12.9716, 77.5946). Paste latitude and longitude in the fields above.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
               <Button type="button" variant="secondary" onClick={closeServiceForm}>
                 Cancel
               </Button>
               <Button type="submit" disabled={actionLoading}>
                 {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingService ? "Update Service" : "Add Service"}
               </Button>
             </div>
          </form>
        </Modal>

        {/* Search Bar and Add Button */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-[28px] border border-slate-200/80 bg-white/90 p-4 shadow-lg shadow-slate-200/30 backdrop-blur-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search services or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => setShowCategoryModal(true)}
                  variant="secondary"
                  className="shrink-0"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Category
                </Button>
                <Button
                  onClick={() => {
                    setShowAddForm(true);
                    setEditingService(null);
                    setFormData(createInitialServiceForm());
                    setImagePreviews([]);
                  }}
                  className="shrink-0"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Service
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Services List */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {filteredServices.length > 0 ? (
              filteredServices.map((service, index) => (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                  className="group relative overflow-hidden rounded-[28px] border border-white/70 bg-white/95 p-5 shadow-lg shadow-slate-200/30 transition-all duration-300 hover:border-primary-200/60 hover:shadow-2xl hover:shadow-primary-200/30"
                >
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 opacity-10 blur-2xl transition-transform group-hover:scale-150"></div>
                  
                  <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      {service.images?.length ? (
                        <div className="grid h-16 w-20 shrink-0 grid-cols-3 grid-rows-2 gap-1 overflow-hidden rounded-2xl bg-slate-100 p-1">
                          {service.images.slice(0, 5).map((img, imageIndex) => (
                            <div
                              key={img}
                              className={`overflow-hidden rounded-lg ${
                                imageIndex === 0 ? "col-span-2 row-span-2" : ""
                              }`}
                            >
                              <img
                                src={img}
                                alt={`${service.name} preview ${imageIndex + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100">
                          <Package className="h-7 w-7 text-blue-600" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-semibold text-slate-900">{service.name}</p>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                            service.status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : service.status === "archived"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                          }`}>
                            {service.status || "draft"}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{service.category?.name || "Uncategorized"}</p>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                          {service.description || "Add a concise service description so clients understand what is included."}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700">
                            {formatCurrency(service.startingPrice)}
                          </span>
                          <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                             {service.completedBookings || 0} completed booking{service.completedBookings === 1 ? "" : "s"}
                           </span>
                          {service.images?.length ? (
                             <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                               {service.images.length} image{service.images.length !== 1 ? "s" : ""}
                             </span>
                           ) : null}
                           {service.videos?.length ? (
                             <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                               {service.videos.length} video{service.videos.length !== 1 ? "s" : ""}
                             </span>
                           ) : null}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end gap-2 lg:self-start">
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => handleEdit(service)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(service._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="rounded-3xl border border-white/70 bg-white/95 p-12 text-center shadow-xl shadow-slate-200/30">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100"
                >
                  <Sparkles className="h-10 w-10 text-blue-400" />
                </motion.div>
                <p className="font-semibold text-slate-600">No services found</p>
                <p className="mt-1 text-sm text-slate-400">
                  {searchQuery ? "Try adjusting your search" : "Add your first service to get started"}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-[999] flex items-start justify-center overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(241,245,249,0.9)_45%,rgba(226,232,240,0.84)_100%)] p-3 pt-4 pb-24 backdrop-blur-md sm:items-center sm:p-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-[30px] border border-white/80 bg-white/95 p-5 shadow-[0_24px_70px_rgba(148,163,184,0.24)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900">Add New Category</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Create a clean service category with a simple name your customers will understand.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setNewCategoryName("");
                }}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Category Name
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Wedding Photography"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100"
                required
              />
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setNewCategoryName("");
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={categoryLoading}>
                  {categoryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Category"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

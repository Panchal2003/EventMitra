import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { 
  Plus, 
  Package, 
  Edit3, 
  Trash2, 
  Eye, 
  IndianRupee, 
  Clock, 
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Loader2,
  Image as ImageIcon,
  Upload,
  Sparkles,
  TrendingUp,
  Zap,
  Target,
  Award,
  Activity,
  ArrowRight,
  Star,
  Shield,
  Users,
  BarChart3
} from "lucide-react";
import { GlassCard } from "../../components/admin/GlassCard";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { providerApi } from "../../services/api";
import { formatCurrency } from "../../utils/currency";

const sectionAnimation = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

const createInitialServiceForm = () => ({
  name: "",
  category: "",
  description: "",
  price: "",
  status: "active",
  images: [],
  allowsMembers: false,
  pricePerMember: "",
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
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const existingPreviewCount = (imagePreviews.length > 0 ? imagePreviews : formData.images).length;

    if (existingPreviewCount + files.length > 5) {
      setNotice({ type: "error", message: "Please keep exactly 5 images in the gallery." });
      return;
    }

    if (files.length > 0) {
      const previewUrls = files.map(file => URL.createObjectURL(file));
      setImagePreviews((previous) => [...previous, ...previewUrls]);
      uploadImages(files);
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
          images: [...prev.images, ...response.data.data.images].slice(0, 5),
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingService && formData.images.length !== 5) {
      setNotice({ type: "error", message: "Please upload exactly 5 service images before adding the service." });
      return;
    }

    setActionLoading(true);
    
    try {
      const payload = {
        ...formData,
        startingPrice: Number(formData.price),
        pricePerMember: formData.allowsMembers ? Number(formData.pricePerMember) : 0,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="space-y-6 px-4 pb-8 pt-4 sm:px-6 lg:px-8 sm:pb-6">
        {/* Hero Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 text-white shadow-xl sm:p-8"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl animate-pulse"></div>
            <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-pink-500/20 blur-3xl animate-pulse delay-1000"></div>
          </div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-40"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium backdrop-blur-sm"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Service Management
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-3 font-display text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl"
                >
                  My Services
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-2 max-w-lg text-sm text-purple-100"
                >
                  Manage your service offerings and track performance.
                </motion.p>
              </div>
              
              {/* Stats preview cards */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="hidden lg:grid lg:grid-cols-3 lg:gap-3"
              >
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-400/20">
                      <Package className="h-5 w-5 text-blue-300" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-200">Total</p>
                      <p className="text-lg font-bold">{totalServices}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-400/20">
                      <CheckCircle2 className="h-5 w-5 text-blue-300" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-200">Active</p>
                      <p className="text-lg font-bold">{activeServices}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/20">
                      <Award className="h-5 w-5 text-amber-300" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-200">Bookings</p>
                      <p className="text-lg font-bold">{totalBookings}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
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
              { label: "Total Services", value: totalServices, color: "from-blue-500 to-blue-600", icon: Package },
              { label: "Active", value: activeServices, color: "from-blue-500 to-blue-600", icon: CheckCircle2 },
              { label: "Total Bookings", value: totalBookings, color: "from-purple-500 to-purple-600", icon: Award },
              { label: "Categories", value: categories.length, color: "from-amber-500 to-orange-500", icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white p-4 shadow">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">{stat.label}</p>
                    <p className={`mt-1 font-display text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </p>
                  </div>
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
                  {(imagePreviews.length > 0 ? imagePreviews : formData.images).length < 5 ? (
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
                  Add 5 strong work photos here. Customers will see this gallery before booking, so better images can improve trust and conversions.
                </div>
                <p className="text-xs text-slate-500">
                  PNG, JPG up to 5MB each. New services now require a complete 5-image gallery.
                </p>
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
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>
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
                  className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-lg transition-all duration-300 hover:shadow-xl"
                >
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 opacity-10 blur-2xl transition-transform group-hover:scale-150"></div>
                  
                  <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
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
                      <div>
                        <p className="font-semibold text-slate-900">{service.name}</p>
                        <p className="text-sm text-slate-500">{service.category?.name || "Uncategorized"}</p>
                        <p className="mt-1 text-xs text-slate-400">{service.description?.substring(0, 60)}...</p>
                        {service.images?.length ? (
                          <p className="mt-1 text-xs font-medium text-blue-600">
                            {service.images.length}/5 portfolio photos ready for customers
                          </p>
                        ) : null}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{formatCurrency(service.startingPrice)}</p>
                        <p className="text-xs text-slate-500">{service.bookings || 0} bookings</p>
                      </div>
                      
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
              <div className="rounded-3xl bg-white p-12 text-center shadow-xl">
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

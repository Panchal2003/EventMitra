import { useEffect, useState } from "react";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";

const defaultValues = {
  name: "",
  category: "",
  description: "",
  startingPrice: "",
  image: "",
  basePricing: "",
  status: "active",
  // Offer Pricing System
  actualPrice: "",
  offerPrice: "",
  offerActive: false,
  offerStartDate: "",
  offerEndDate: "",
};

export function ServiceFormModal({
  busy,
  categories,
  initialValues,
  onClose,
  onSubmit,
  open,
}) {
  const [formState, setFormState] = useState(defaultValues);

  useEffect(() => {
    if (open) {
      setFormState(
        initialValues
          ? {
              name: initialValues.name || "",
              category: initialValues.category?._id || "",
              description: initialValues.description || "",
              startingPrice: String(initialValues.startingPrice || ""),
              image: initialValues.image || "",
              basePricing: initialValues.basePricing || "",
              status: initialValues.status || "active",
              // Offer Pricing System
              actualPrice: initialValues.actualPrice ? String(initialValues.actualPrice) : "",
              offerPrice: initialValues.offerPrice ? String(initialValues.offerPrice) : "",
              offerActive: initialValues.offerActive || false,
              offerStartDate: initialValues.offerStartDate ? new Date(initialValues.offerStartDate).toISOString().split('T')[0] : "",
              offerEndDate: initialValues.offerEndDate ? new Date(initialValues.offerEndDate).toISOString().split('T')[0] : "",
            }
          : defaultValues
      );
    }
  }, [initialValues, open]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormState((previous) => ({ 
      ...previous, 
      [name]: type === "checkbox" ? checked : value 
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({
      ...formState,
      startingPrice: Number(formState.startingPrice),
      actualPrice: formState.actualPrice ? Number(formState.actualPrice) : null,
      offerPrice: formState.offerPrice ? Number(formState.offerPrice) : null,
      offerStartDate: formState.offerStartDate ? new Date(formState.offerStartDate) : null,
      offerEndDate: formState.offerEndDate ? new Date(formState.offerEndDate) : null,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialValues ? "Edit Service" : "Add New Service"}
      description="Create booking-ready services with a category, starting price, description, and image."
      size="xl"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="service-form" isLoading={busy}>
            {initialValues ? "Save Changes" : "Create Service"}
          </Button>
        </div>
      }
    >
      <form id="service-form" className="space-y-5" onSubmit={handleSubmit}>
        {/* Service Name */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Service Name</label>
          <input
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
            name="name"
            value={formState.name}
            onChange={handleChange}
            placeholder="e.g., Bridal Mehndi"
          />
        </div>

        {/* Category & Price Row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Category</label>
            <select
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
              name="category"
              value={formState.category}
              onChange={handleChange}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Starting Price (₹)</label>
            <input
              required
              min="0"
              type="number"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
              name="startingPrice"
              value={formState.startingPrice}
              onChange={handleChange}
              placeholder="e.g., 12000"
            />
          </div>
        </div>

        {/* Image URL */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Image URL</label>
          <input
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
            name="image"
            value={formState.image}
            onChange={handleChange}
            placeholder="https://images.unsplash.com/..."
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Description</label>
          <textarea
            required
            className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100 resize-none"
            name="description"
            value={formState.description}
            onChange={handleChange}
            placeholder="Describe the service offering, customer value, and logistics..."
          />
        </div>

        {/* Base Pricing Note */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Base Pricing Note</label>
          <input
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
            name="basePricing"
            value={formState.basePricing}
            onChange={handleChange}
            placeholder="e.g., Starts at ₹12,000 for bridal mehndi coverage"
          />
        </div>

        {/* Offer Pricing Section */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">Enable Offer Pricing</p>
              <p className="text-sm text-slate-500">Show discounted price to customers</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                name="offerActive"
                checked={formState.offerActive}
                onChange={handleChange}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:translate-x-1 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-6"></div>
            </label>
          </div>

          {formState.offerActive && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Actual Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
                    name="actualPrice"
                    value={formState.actualPrice}
                    onChange={handleChange}
                    placeholder="Original price"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Offer Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
                    name="offerPrice"
                    value={formState.offerPrice}
                    onChange={handleChange}
                    placeholder="Discounted price"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Offer Start Date</label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
                    name="offerStartDate"
                    value={formState.offerStartDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Offer End Date</label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
                    name="offerEndDate"
                    value={formState.offerEndDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Status</label>
          <select
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
            name="status"
            value={formState.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}

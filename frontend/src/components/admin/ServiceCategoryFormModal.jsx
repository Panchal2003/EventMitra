import { useEffect, useState } from "react";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";

const defaultValues = {
  name: "",
  description: "",
};

export function ServiceCategoryFormModal({ busy, onClose, onSubmit, open }) {
  const [formState, setFormState] = useState(defaultValues);

  useEffect(() => {
    if (open) {
      setFormState(defaultValues);
    }
  }, [open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(formState);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Service Category"
      description="Create reusable service groups so EventMitra stays structured and booking-ready."
      size="md"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="service-category-form" isLoading={busy}>
            Create Category
          </Button>
        </div>
      }
    >
      <form id="service-category-form" className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Category Name</label>
          <input
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
            name="name"
            value={formState.name}
            onChange={handleChange}
            placeholder="e.g., Bridal Beauty"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Description</label>
          <textarea
            className="min-h-[100px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100 resize-none"
            name="description"
            value={formState.description}
            onChange={handleChange}
            placeholder="Short context for admins and future booking experiences..."
          />
        </div>
      </form>
    </Modal>
  );
}


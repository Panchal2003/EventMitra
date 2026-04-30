import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { Button } from "../common/Button";

export function ProviderProfileCard({
  categories,
  onSave,
  onUpload,
  profile,
  saveBusy,
  uploadBusy,
}) {
  const [formState, setFormState] = useState({
    name: "",
    serviceCategory: "",
    experience: "",
    basePrice: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    if (profile) {
      setFormState({
        name: profile.name || "",
        serviceCategory: profile.serviceCategory?._id || "",
        experience: String(profile.experience || ""),
        basePrice: String(profile.basePrice || ""),
      });
    }
  }, [profile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((previous) => ({ ...previous, [name]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    await onSave({
      ...formState,
      experience: Number(formState.experience),
      basePrice: Number(formState.basePrice),
    });
  };

  const handleUploadSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFiles.length) {
      return;
    }

    await onUpload(selectedFiles);
    setSelectedFiles([]);
    event.target.reset();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-lg sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-700">
          Profile setup
        </p>
        <h2 className="mt-2 font-display text-xl font-semibold text-slate-950">
          Keep your expert profile complete
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          These details power future booking matching and pricing context inside EventMitra.
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleProfileSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Name</span>
            <input
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              name="name"
              value={formState.name}
              onChange={handleChange}
              placeholder="Aarav Events"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Service category</span>
            <select
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              name="serviceCategory"
              value={formState.serviceCategory}
              onChange={handleChange}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Experience (years)</span>
              <input
                required
                min="0"
                type="number"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                name="experience"
                value={formState.experience}
                onChange={handleChange}
                placeholder="8"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Base price (₹)</span>
              <input
                required
                min="0"
                type="number"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                name="basePrice"
                value={formState.basePrice}
                onChange={handleChange}
                placeholder="45000"
              />
            </label>
          </div>

          <div className="flex justify-end mt-6">
            <Button type="submit" isLoading={saveBusy}>
              Save profile
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-lg sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-700">
          Portfolio upload
        </p>
        <h2 className="mt-2 font-display text-xl font-semibold text-slate-950">
          Showcase your work
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Upload images or PDFs to build trust quickly when bookings are assigned.
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleUploadSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Portfolio files</span>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 file:mr-4 file:rounded-full file:border-0 file:bg-blue-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-600"
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,application/pdf"
              onChange={(event) => setSelectedFiles(Array.from(event.target.files || []))}
            />
          </label>

          {selectedFiles.length ? (
            <div className="rounded-3xl bg-slate-50/90 p-4">
              <p className="text-sm font-semibold text-slate-900">Ready to upload</p>
              <div className="mt-3 space-y-2">
                {selectedFiles.map((file) => (
                  <div key={`${file.name}-${file.size}`} className="text-sm text-slate-500">
                    {file.name}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex justify-end mt-6">
            <Button type="submit" variant="secondary" isLoading={uploadBusy}>
              <Upload className="h-4 w-4" />
              Upload portfolio
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Uploaded portfolio</p>
            <p className="text-sm text-slate-500">
              Base price {formatCurrency(profile?.basePrice || 0)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {profile?.portfolio?.length ? (
              profile.portfolio.map((item) => {
                const isImage = item.mimeType?.startsWith("image/");

                return (
                  <a
                    key={`${item.fileUrl}-${item.uploadedAt}`}
                    href={item.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="overflow-hidden rounded-xl border border-slate-100 bg-white/80 p-2 transition hover:-translate-y-0.5 hover:shadow-soft"
                  >
                    {isImage ? (
                      <div className="aspect-square w-full overflow-hidden rounded-lg bg-slate-100">
                        <img
                          src={item.fileUrl}
                          alt={item.fileName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-square items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">
                        PDF
                      </div>
                    )}
                    <p className="mt-2 truncate text-xs font-semibold text-slate-900">
                      {item.fileName}
                    </p>
                  </a>
                );
              })
            ) : (
              <div className="col-span-2 rounded-xl border border-dashed border-slate-200 bg-white/70 px-4 py-8 text-center">
                <p className="font-semibold text-slate-900">No portfolio uploaded</p>
                <p className="mt-1 text-xs text-slate-500">
                  Upload your work samples
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


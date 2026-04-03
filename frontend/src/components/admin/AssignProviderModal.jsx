import { useEffect, useState } from "react";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";

export function AssignProviderModal({
  booking,
  busy,
  onClose,
  onSubmit,
  open,
  providers,
}) {
  const [providerId, setProviderId] = useState("");

  useEffect(() => {
    if (open) {
      setProviderId(booking?.provider?._id || "");
    }
  }, [booking, open]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(providerId);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={booking?.provider ? "Change provider" : "Assign provider"}
      description="Pick from approved providers to keep execution quality high and response times fast."
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="provider-form" isLoading={busy}>
            Save assignment
          </Button>
        </div>
      }
    >
      <form id="provider-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-3xl bg-slate-50/90 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
            Booking details
          </p>
          <p className="mt-2 font-display text-lg font-semibold text-slate-950">
            {booking?.service?.name}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {booking?.customer?.name} • {booking?.location}
          </p>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">Approved provider</span>
          <select
            required
            className="field py-3 sm:py-2"
            value={providerId}
            onChange={(event) => setProviderId(event.target.value)}
          >
            <option value="">Select a provider</option>
            {providers.map((provider) => (
              <option key={provider._id} value={provider._id}>
                {provider.businessName || provider.name}
              </option>
            ))}
          </select>
        </label>
      </form>
    </Modal>
  );
}


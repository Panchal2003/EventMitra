import { useEffect, useState } from "react";
import { formatCurrency } from "../../utils/currency";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";

const defaultValues = {
  eventDate: "",
  location: "",
  guestCount: "100",
  notes: "",
};

export function CustomerBookingModal({ busy, onClose, onSubmit, open, service }) {
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
    await onSubmit({
      serviceId: service?._id,
      eventDate: formState.eventDate,
      location: formState.location,
      guestCount: Number(formState.guestCount),
      notes: formState.notes,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Book service"
      description="Submit your event request so EventMitra can route it through admin review and provider assignment."
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="customer-booking-form" isLoading={busy}>
            Confirm booking
          </Button>
        </div>
      }
    >
      <form id="customer-booking-form" className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <div className="rounded-3xl bg-slate-50/90 p-4 sm:col-span-2">
          <p className="font-display text-xl font-semibold text-slate-950">{service?.name}</p>
          <p className="mt-1 text-sm text-slate-500">{service?.category?.name}</p>
          <p className="mt-3 text-sm text-slate-600">{service?.description}</p>
          <p className="mt-3 text-sm font-semibold text-slate-900">
            Starting from {formatCurrency(service?.startingPrice || 0)}
          </p>
        </div>

        <label className="space-y-2 sm:col-span-1">
          <span className="text-sm font-semibold text-slate-700">Event date</span>
          <input
            required
            type="date"
            className="field py-3 sm:py-2"
            name="eventDate"
            value={formState.eventDate}
            onChange={handleChange}
          />
        </label>

        <label className="space-y-2 sm:col-span-1">
          <span className="text-sm font-semibold text-slate-700">Guest count</span>
          <input
            required
            min="1"
            type="number"
            className="field py-3 sm:py-2"
            name="guestCount"
            value={formState.guestCount}
            onChange={handleChange}
          />
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-semibold text-slate-700">Location</span>
          <input
            required
            className="field py-3 sm:py-2"
            name="location"
            value={formState.location}
            onChange={handleChange}
            placeholder="Jaipur"
          />
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-semibold text-slate-700">Notes</span>
          <textarea
            className="field-area min-h-[120px] sm:min-h-[100px]"
            name="notes"
            value={formState.notes}
            onChange={handleChange}
            placeholder="Share event preferences, styling notes, or timeline details."
          />
        </label>
      </form>
    </Modal>
  );
}


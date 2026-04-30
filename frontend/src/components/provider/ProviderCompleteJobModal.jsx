import { Button } from "../common/Button";
import { Modal } from "../common/Modal";

export function ProviderCompleteJobModal({ booking, busy, onClose, onSubmit, open }) {
  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Mark job complete"
      description="Mark this event as delivered. EventMitra will generate the final OTP for the customer, and the customer will finish the booking from their own side."
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="complete-job-form" isLoading={busy}>
            Mark complete
          </Button>
        </div>
      }
    >
      <form id="complete-job-form" className="space-y-4" onSubmit={handleSubmit}>
        <div className="rounded-3xl bg-slate-50/90 p-4">
          <p className="font-semibold text-slate-900">{booking?.service?.name}</p>
          <p className="mt-1 text-sm text-slate-500">
            {booking?.customer?.name} | {booking?.location}
          </p>
        </div>

        <div className="rounded-3xl border border-primary-100 bg-primary-50 p-4 text-sm leading-6 text-primary-700">
          Once you mark the job complete, this booking moves to the customer confirmation step.
          The customer will enter the final OTP and submit feedback in their app. As soon as
          they complete that step, the booking will close automatically.
        </div>
      </form>
    </Modal>
  );
}

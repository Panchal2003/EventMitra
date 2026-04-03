import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";
import { MessageSquare, Star } from "lucide-react";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import { StatusBadge } from "../common/StatusBadge";

export function ProviderBookingDetailsModal({ booking, onClose, open }) {
  const services = booking?.services?.length ? booking.services : booking?.service ? [booking.service] : [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Booking details"
      description="Review the full booking statement before you accept, start, or complete the job."
      footer={
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      {booking ? (
        <div className="space-y-4">
          <div className="rounded-3xl bg-slate-50/90 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-display text-xl font-semibold text-slate-950">
                  {services[0]?.name || booking.service?.name}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {services.length} booked service{services.length !== 1 ? "s" : ""} | {formatDate(booking.eventDate)}
                </p>
              </div>
              <StatusBadge status={booking.status} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
                Customer
              </p>
              <p className="mt-2 font-semibold text-slate-900">{booking.customer?.name}</p>
              <p className="mt-1 text-sm text-slate-500">{booking.customer?.email}</p>
              <p className="mt-1 text-sm text-slate-500">{booking.customer?.phone || "-"}</p>
            </div>

            <div className="rounded-3xl bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
                Event
              </p>
              <p className="mt-2 font-semibold text-slate-900">{formatDate(booking.eventDate)}</p>
              <p className="mt-1 text-sm text-slate-500">{booking.location}</p>
              <p className="mt-1 text-sm text-slate-500">
                {booking.guestCount} guests {booking.eventTime ? `| ${booking.eventTime}` : ""}
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
              Booking Statement
            </p>
            <div className="mt-3 space-y-3">
              {services.map((service) => (
                <div
                  key={service._id}
                  className="flex items-start justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{service.name}</p>
                    {service.category?.name ? (
                      <p className="mt-1 text-xs font-medium text-primary-700">{service.category.name}</p>
                    ) : null}
                    {service.description ? (
                      <p className="mt-1 text-sm text-slate-500">{service.description}</p>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-slate-900">
                    {formatCurrency(service.startingPrice || 0)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Total Booking Value</span>
                <span className="font-display text-xl font-semibold text-slate-950">
                  {formatCurrency(booking.totalAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Admin Fee (11%)</span>
                <span>- {formatCurrency(booking.adminProfit || Math.round(booking.totalAmount * 0.11))}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <span className="text-sm font-semibold text-primary-700">Your Share</span>
                <span className="font-display text-xl font-semibold text-primary-700">
                  {formatCurrency(booking.providerAmount || Math.round(booking.totalAmount * 0.89))}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
              Notes
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {booking.notes || "No additional notes were provided for this booking."}
            </p>
          </div>

          {booking.feedback ? (
            <div className="rounded-3xl bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
                Customer Feedback
              </p>
              <div className="mt-3 flex items-center gap-2 text-primary-700">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={`details-rating-${booking._id}-${index}`}
                    className={`h-4 w-4 ${index < Number(booking.feedback.rating || 0) ? "fill-current" : ""}`}
                  />
                ))}
                <span className="text-sm font-semibold">
                  {Number(booking.feedback.rating || 0).toFixed(1)} rating
                </span>
              </div>
              {booking.feedback.comment ? (
                <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-600">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                  <span>{booking.feedback.comment}</span>
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="rounded-3xl border border-primary-100 bg-primary-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
              Workflow
            </p>
            <p className="mt-2 text-sm leading-6 text-primary-700">
              Accept the request, verify the customer's start OTP to begin work, then mark the job complete. After that, the customer finishes the booking in their app using the final OTP and feedback form.
            </p>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

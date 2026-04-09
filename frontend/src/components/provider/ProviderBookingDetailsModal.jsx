import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";
import { XCircle, CalendarClock, User, FileText, CreditCard } from "lucide-react";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import { StatusBadge } from "../common/StatusBadge";

export function ProviderBookingDetailsModal({ booking, onClose, open }) {
  const services = booking?.services?.length ? booking.services : booking?.service ? [booking.service] : [];
  const isCancelled = booking?.status === "cancelled" && booking?.cancellation;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isCancelled ? "Cancelled Booking" : "Booking details"}
      description={isCancelled ? "View cancellation details." : "Review the full booking statement before you accept, start, or complete the job."}
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
          {isCancelled && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm font-semibold text-rose-800 mb-3">Cancellation Details</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Cancelled At</span>
                  <span className="text-sm font-medium text-slate-800">
                    {booking.cancellation.cancelledAt ? formatDate(booking.cancellation.cancelledAt, true) : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Cancelled By</span>
                  <span className="text-sm font-medium text-slate-800">
                    {booking.cancellation.cancelledBy?.name || "Unknown"}
                  </span>
                </div>
                {booking.cancellation.cancelReason && (
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-600">Reason</span>
                    <span className="text-sm text-slate-800">{booking.cancellation.cancelReason}</span>
                  </div>
                )}
                {booking.cancellation.refundAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Refund</span>
                    <span className="text-sm font-semibold text-emerald-600">
                      {formatCurrency(booking.cancellation.refundAmount)} ({booking.cancellation.cancellationPolicy?.replace('_', ' ')})
                    </span>
                  </div>
                )}
                {booking.cancellation.cancellationPolicy === "no_refund" && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Refund</span>
                    <span className="text-sm text-slate-500">No refund</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isCancelled && (
            <>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{services[0]?.name || "Service"}</p>
                    <p className="text-sm text-slate-500">{formatDate(booking.eventDate)}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Customer</p>
                  <p className="font-medium text-slate-900">{booking.customer?.name}</p>
                  <p className="text-sm text-slate-500">{booking.customer?.phone || "-"}</p>
                </div>

                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Event</p>
                  <p className="font-medium text-slate-900">{formatDate(booking.eventDate)}</p>
                  <p className="text-sm text-slate-500">{booking.location}</p>
                  <p className="text-sm text-slate-500">{booking.guestCount} guests</p>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total Amount</span>
                  <span className="text-lg font-bold text-slate-900">{formatCurrency(booking.totalAmount)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
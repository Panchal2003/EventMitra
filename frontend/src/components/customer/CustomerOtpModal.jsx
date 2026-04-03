import { useEffect, useState } from "react";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import { CalendarCheck2, MessageSquare, ShieldCheck, Sparkles, Star, User } from "lucide-react";

function getBookingTitle(booking) {
  if (booking?.service?.name) {
    return booking.service.name;
  }

  if (booking?.services?.length) {
    return booking.services.map((service) => service?.name).filter(Boolean).join(", ");
  }

  return "Service booking";
}

export function CustomerOtpModal({ booking, busy, onClose, onSubmit, open, rating = 0, comment = "", onRatingChange, onCommentChange }) {
  const [otp, setOtp] = useState("");
  const [localRating, setLocalRating] = useState(0);
  const [localComment, setLocalComment] = useState("");

  useEffect(() => {
    if (open) {
      setOtp("");
      setLocalRating(0);
      setLocalComment("");
    }
  }, [open]);

  useEffect(() => {
    if (rating !== undefined) setLocalRating(rating);
    if (comment !== undefined) setLocalComment(comment);
  }, [rating, comment]);

  const handleRatingChange = (value) => {
    setLocalRating(value);
    if (onRatingChange) onRatingChange(value);
  };

  const handleCommentChange = (event) => {
    const value = event.target.value;
    setLocalComment(value);
    if (onCommentChange) onCommentChange(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(otp, localRating, localComment);
  };

  const providerName = booking?.provider?.businessName || booking?.provider?.name || "Assigned provider";
  const bookingTitle = getBookingTitle(booking);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Complete Booking"
      description="Enter your OTP to verify the service is complete, then share your feedback."
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" form="customer-otp-form" isLoading={busy} className="w-full sm:w-auto">
            Complete Booking
          </Button>
        </div>
      }
    >
      <form id="customer-otp-form" className="space-y-5" onSubmit={handleSubmit}>
        <div className="rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-blue-50 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-primary-600 shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
                Completion Review
              </p>
              <p className="mt-1 text-base font-semibold text-slate-900 sm:text-lg">{bookingTitle}</p>
              <div className="mt-2 flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:flex-wrap sm:items-center">
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-4 w-4 text-slate-400" />
                  {providerName}
                </span>
                {booking?.eventDate ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarCheck2 className="h-4 w-4 text-slate-400" />
                    {new Date(booking.eventDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {booking?.customerOtp ? (
          <div className="rounded-3xl border border-primary-100 bg-primary-50/80 p-4 text-sm text-primary-700">
            Your OTP for this booking: <span className="font-semibold">{booking.customerOtp}</span>
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
              <label className="block">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <ShieldCheck className="h-4 w-4 text-primary-600" />
                  Enter OTP
                </span>
                <input
                  required
                  maxLength={4}
                  inputMode="numeric"
                  className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-2xl font-bold tracking-[0.45em] text-slate-900 outline-none transition focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100 sm:text-3xl"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="0000"
                />
              </label>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Enter the 4-digit OTP shared for this completed booking.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
              <label className="mb-3 block text-sm font-semibold text-slate-700">
                Rate your experience
              </label>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;
                  const active = value <= localRating;
                  return (
                    <button
                      key={`customer-rating-${value}`}
                      type="button"
                      onClick={() => handleRatingChange(value)}
                      className={`flex h-12 items-center justify-center rounded-2xl border transition sm:h-14 ${
                        active
                          ? "border-amber-200 bg-amber-50 text-amber-500 shadow-sm"
                          : "border-slate-200 bg-slate-50 text-slate-300 hover:border-amber-100 hover:text-amber-400"
                      }`}
                    >
                      <Star className={`h-5 w-5 sm:h-6 sm:w-6 ${active ? "fill-current" : ""}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <MessageSquare className="h-4 w-4 text-primary-600" />
              Share your feedback
            </label>
            <textarea
              rows={6}
              value={localComment}
              onChange={handleCommentChange}
              placeholder="Tell us about service quality, punctuality, behavior, and overall experience."
              className="mt-3 min-h-[180px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100 sm:min-h-[220px]"
            />
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Your rating and feedback help other customers choose better providers.
            </p>
          </div>
        </div>
      </form>
    </Modal>
  );
}

import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
  Star,
  MessageSquare,
  KeyRound,
} from "lucide-react";
import { customerApi } from "../../services/api";
import { Button } from "../../components/common/Button";
import { formatCurrency } from "../../utils/currency";

export function CustomerRemainingPaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [paymentData, setPaymentData] = useState(null);
  const [booking, setBooking] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState({ rating: 5, comment: "" });
  const [isReadyToPay, setIsReadyToPay] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [requiresOtp, setRequiresOtp] = useState(false);

  const loadPayment = useCallback(async () => {
    if (!bookingId) {
      setError("Invalid booking ID");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      const response = await customerApi.getRemainingPayment(bookingId);
      const data = response.data?.data || {};
      
      if (data.amount && (data.orderId || data.upiQrCodeUrl || data.qrCodeDataUrl)) {
        setPaymentData(data);
        setBooking(null);
        // Check if OTP is required
        setRequiresOtp(data.requiresCompletionOtp || false);
        // Check if we have pending feedback from profile page - store it but don't show modal
        const stored = localStorage.getItem("pendingFeedback");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.bookingId === bookingId) {
              setFeedbackData(parsed.feedback || { rating: 5, comment: "" });
              localStorage.removeItem("pendingFeedback");
              // Do not auto-open the modal; the client will see it when confirming payment.
            }
          } catch (e) {
            localStorage.removeItem("pendingFeedback");
          }
        }
      } else if (data.booking) {
        setPaymentData(null);
        setBooking(data.booking);
        // Show helpful message based on booking status
        const statusMessages = {
          "provider_assigned": "Your booking is waiting for partner confirmation.",
          "confirmed": "The partner has accepted your booking. Wait for the service to be completed before making the remaining payment.",
          "in_progress": "The service is in progress. Remaining payment will be available after completion.",
        };
        if (statusMessages[data.booking.status]) {
          setError(statusMessages[data.booking.status]);
        }
      } else if (data.message?.includes("already been completed")) {
        setError("Payment already completed");
        setPaymentData(null);
        setBooking(null);
      } else if (data.message) {
        setError(data.message);
        setPaymentData(null);
        setBooking(null);
      } else {
        setError("Unable to load payment. The booking might not be eligible for remaining payment.");
        setPaymentData(null);
        setBooking(null);
      }
    } catch (requestError) {
      const errorMsg = requestError.response?.data?.message || requestError.message || "Unable to load remaining payment details.";
      // Provide more helpful error messages based on common issues
      if (errorMsg.includes("not available yet") || errorMsg.includes("status")) {
        setError("Remaining payment is not available yet. The partner needs to complete the service first.");
      } else if (errorMsg.includes("not found")) {
        setError("Booking not found or access denied.");
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadPayment();
  }, [loadPayment]);

  const handleRatingChange = (rating) => {
    setFeedbackData({ ...feedbackData, rating });
  };

  const handleCommentChange = (comment) => {
    setFeedbackData({ ...feedbackData, comment });
  };

  const handleOtpChange = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    setOtpValue(digits);
  };

  // Update isReadyToPay when feedback or OTP changes
  useEffect(() => {
    const hasRating = feedbackData.rating > 0;
    const hasComment = feedbackData.comment.trim().length > 0;
    const hasOtp = !requiresOtp || otpValue.trim().length === 4;
    setIsReadyToPay(hasRating && hasComment && hasOtp);
  }, [feedbackData.rating, feedbackData.comment, otpValue, requiresOtp]);

  const handlePayNow = () => {
    // Show feedback modal first
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedbackAndPay = async () => {
    if (!paymentData) {
      return;
    }

    // Check if feedback is provided
    const hasRating = feedbackData.rating > 0;
    const hasComment = feedbackData.comment.trim().length > 0;
    
    if (!hasRating || !hasComment) {
      setError("Please provide rating and feedback before payment.");
      return;
    }

    // Submit feedback only - partner will collect payment
    try {
      setPaying(true);
      setError("");
      
      // Submit feedback via API
      await customerApi.verifyOtp(bookingId, {
        otp: requiresOtp ? otpValue.trim() : "direct_complete",
        feedback: feedbackData,
      });
      
      console.log("Feedback submitted. Partner will collect payment.");
      setShowFeedbackModal(false);
      setSuccess("Thank you for your feedback. The partner will now collect the remaining payment.");
      setFeedbackData({ rating: 5, comment: "" });
      setOtpValue("");
    } catch (feedbackError) {
      console.error("Feedback submission error:", feedbackError);
      setError(feedbackError.response?.data?.message || "Failed to submit feedback. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
          <p className="text-sm text-slate-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-5">
        <button
          type="button"
          onClick={() => navigate("/customer/profile?tab=bookings")}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary-200 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to bookings
        </button>

        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl">
          <div className="bg-gradient-to-r from-slate-950 via-primary-900 to-cyan-700 px-6 py-6 text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-100">
              <CreditCard className="h-3.5 w-3.5" />
              Remaining Payment
            </div>
            <h1 className="mt-4 text-2xl font-display font-black sm:text-3xl">
              Confirm Your Payment
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-cyan-100">
              The partner will collect the remaining payment from you after you confirm.
            </p>
          </div>

          <div className="space-y-5 p-6 sm:p-7">
            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            ) : null}

            {booking && booking.payment?.paymentStatus === "full_paid" ? (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                <h2 className="mt-4 text-xl font-bold text-emerald-800">Payment already completed</h2>
                <p className="mt-2 text-sm text-emerald-700">
                  The remaining amount has already been collected. Return to your bookings to complete the final OTP step if it is still pending.
                </p>
                <Button className="mt-5" onClick={() => navigate("/customer/profile?tab=bookings")}>
                  Go to bookings
                </Button>
              </div>
            ) : paymentData ? (
              <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Amount Due</p>
                    <p className="mt-3 text-4xl font-display font-black text-slate-950">
                      {formatCurrency(paymentData.amountInRupees)}
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase text-slate-500">Partner</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{paymentData.providerName}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase text-slate-500">Security</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">Razorpay verified</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <ShieldCheck className="h-4 w-4 text-primary-600" />
                      How this works
                    </div>
                    <ol className="mt-4 space-y-2 text-sm text-slate-600">
                      <li>1. Review the remaining amount and partner details.</li>
                      <li>2. Share your rating and completion confirmation.</li>
                      <li>3. The partner collects the remaining amount after confirmation.</li>
                    </ol>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-center mb-4">
                    <p className="text-sm font-semibold text-slate-700">Payment Confirmation</p>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={handlePayNow}
                      disabled={paying}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Confirm Payment
                      </span>
                      <span>{formatCurrency(paymentData.amountInRupees)}</span>
                    </button>
                    
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-600">
                      Confirm the booking completion details. The partner will collect the remaining payment from you.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center">
                <p className="text-amber-700">No payment data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showFeedbackModal && paymentData && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(241,245,249,0.9)_45%,rgba(226,232,240,0.84)_100%)] p-3 pt-4 pb-24 backdrop-blur-md sm:items-center sm:p-5">
          <div className="w-full max-w-md rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-[0_24px_70px_rgba(148,163,184,0.24)] sm:p-6">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 sm:h-16 sm:w-16">
                <Star className="h-7 w-7 text-white sm:h-8 sm:w-8" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-900 sm:text-xl">Rate & Confirm</h2>
              <p className="mt-2 text-sm text-slate-600">
                Please rate your experience. The partner will collect payment from you.
              </p>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-slate-700">
                Rating <span className="text-rose-500">*</span>
              </label>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-7 w-7 sm:h-8 sm:w-8 ${
                        star <= feedbackData.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700">
                Feedback <span className="text-rose-500">*</span>
              </label>
              <div className="mt-2 relative">
                <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <textarea
                  value={feedbackData.comment}
                  onChange={(e) => handleCommentChange(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm focus:border-primary-500 focus:outline-none"
                  rows={3}
                />
              </div>
            </div>

            {requiresOtp && (
              <div className="mt-4">
                <label className="block text-sm font-semibold text-slate-700">
                  OTP <span className="text-rose-500">*</span>
                </label>
                <p className="text-xs text-slate-500 mb-2">Enter the 4-digit OTP shared by the partner</p>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={otpValue}
                    onChange={(e) => handleOtpChange(e.target.value)}
                    placeholder="Enter 4-digit OTP"
                    maxLength={4}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-center text-2xl font-mono tracking-[0.35em] text-slate-900 focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackData({ rating: 5, comment: "" });
                  setOtpValue("");
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmitFeedbackAndPay}
                isLoading={paying}
                disabled={!isReadyToPay}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Confirm Payment
              </Button>
              {!isReadyToPay && (
                <p className="mt-2 text-center text-xs text-slate-500">
                  Select rating, enter feedback & OTP to confirm
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

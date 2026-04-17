import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  QrCode,
  ShieldCheck,
  Star,
  MessageSquare,
  KeyRound,
  Smartphone,
  XCircle,
} from "lucide-react";
import { customerApi } from "../../services/api";
import { Button } from "../../components/common/Button";
import { formatCurrency } from "../../utils/currency";
import { openRazorpayCheckout } from "../../utils/razorpay";
import { useAuth } from "../../context/AuthContext";

export function CustomerRemainingPaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [showUpiQrModal, setShowUpiQrModal] = useState(false);

  const loadPayment = async () => {
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
              // Don't auto-open modal - user will see it when clicking Pay Now
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
          "provider_assigned": "Your booking is waiting for provider confirmation.",
          "confirmed": "The provider has accepted your booking. Wait for the service to be completed before making remaining payment.",
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
        setError("Remaining payment is not available yet. The provider needs to complete the service first.");
      } else if (errorMsg.includes("not found")) {
        setError("Booking not found or access denied.");
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestPaymentConfig = async () => {
    const response = await customerApi.getRemainingPayment(bookingId);
    return response.data?.data || {};
  };

  useEffect(() => {
    loadPayment();
  }, [bookingId]);

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

    // First submit feedback
    try {
      setPaying(true);
      setError("");
      
      // Submit feedback via API
      await customerApi.verifyOtp(bookingId, {
        otp: requiresOtp ? otpValue.trim() : "direct_complete",
        feedback: feedbackData,
      });
      
      console.log("Feedback submitted successfully");
    } catch (feedbackError) {
      console.error("Feedback submission error:", feedbackError);
      // Continue with payment even if feedback fails
    }

    // Then open Razorpay for payment
    try {
      const latestPaymentData = await fetchLatestPaymentConfig();
      const effectivePaymentData = latestPaymentData?.orderId ? latestPaymentData : paymentData;

      setPaymentData(effectivePaymentData);

      console.log("Customer paying remaining amount:", {
        key: effectivePaymentData.key,
        amount: effectivePaymentData.amount,
        order_id: effectivePaymentData.orderId,
      });

      if (!effectivePaymentData.orderId) {
        throw new Error(
          effectivePaymentData.razorpayErrorMessage ||
            "Razorpay popup is not available for this payment yet."
        );
      }

      const razorpayResponse = await openRazorpayCheckout({
        key: effectivePaymentData.key,
        amount: Number(effectivePaymentData.amount),
        currency: effectivePaymentData.currency || "INR",
        order_id: effectivePaymentData.orderId,
        name: "EventMitra",
        description: `Remaining payment for ${effectivePaymentData.serviceNames || "booking"}`,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: "#2563eb" },
      });

      console.log("Razorpay payment successful:", razorpayResponse);

      if (!razorpayResponse.razorpay_payment_id) {
        console.log("Payment modal closed by user");
        setPaying(false);
        setShowFeedbackModal(false);
        return;
      }

      // Verify payment
      await customerApi.verifyRemainingPayment(bookingId, razorpayResponse);

      setShowFeedbackModal(false);
      setSuccess("Payment completed successfully! Thank you for your feedback and payment.");
      setPaymentData(null);
      setFeedbackData({ rating: 5, comment: "" });
      await loadPayment();
    } catch (err) {
      console.error("Payment error:", err);
      if (err.message?.includes("modal closed") || err.message?.includes("Payment modal")) {
        setError("Payment cancelled. You can try again.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || "Payment failed. Please try again.");
      }
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
              <QrCode className="h-3.5 w-3.5" />
              Remaining Payment
            </div>
            <h1 className="mt-4 text-2xl font-display font-black sm:text-3xl">
              Complete Your Final Payment
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-cyan-100">
              Pay the remaining amount securely through Razorpay. The QR code opens the same payment flow on another device if you want to scan it.
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
                        <p className="text-[11px] font-semibold uppercase text-slate-500">Provider</p>
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
                      <li>1. Select payment method above.</li>
                      <li>2. Complete payment through secure gateway.</li>
                      <li>3. Your payment will be processed instantly.</li>
                    </ol>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-center mb-4">
                    <p className="text-sm font-semibold text-slate-700">Select Payment Method</p>
                  </div>
                  
                  <div className="space-y-3">
                    {paymentData.upiQrCodeUrl && (
                      <button
                        onClick={() => setShowUpiQrModal(true)}
                        disabled={paying}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="flex items-center gap-2">
                          <Smartphone className="h-5 w-5" />
                          Pay with UPI QR
                        </span>
                        <span>{formatCurrency(paymentData.upiAmount || paymentData.amountInRupees)}</span>
                      </button>
                    )}
                    
                    <button
                      onClick={handlePayNow}
                      disabled={paying || !paymentData.orderId}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Pay with Razorpay
                      </span>
                      <span>{formatCurrency(paymentData.amountInRupees)}</span>
                    </button>
                    
                    <div className="text-center text-xs text-slate-500 mt-2">
                      Secure payment via UPI QR or Razorpay (Cards, Wallets, NetBanking)
                    </div>
                    {!paymentData.orderId && !paymentData.upiQrCodeUrl && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-xs text-amber-700">
                        {paymentData.razorpayErrorMessage || "Payment options are temporarily unavailable. Please retry shortly."}
                      </div>
                    )}
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
              <h2 className="mt-4 text-lg font-bold text-slate-900 sm:text-xl">Rate & Pay</h2>
              <p className="mt-2 text-sm text-slate-600">
                Please rate your experience and then complete your payment.
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
                <p className="text-xs text-slate-500 mb-2">Enter the 4-digit OTP from provider</p>
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
                Pay {formatCurrency(paymentData?.amountInRupees)} Now
              </Button>
              {!isReadyToPay && (
                <p className="mt-2 text-center text-xs text-slate-500">
                  Select rating, enter feedback & OTP to enable payment
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {showUpiQrModal && paymentData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden animate-scaleIn sm:max-w-md">
            <div className="relative bg-gradient-to-r from-teal-600 to-emerald-600 p-5 text-center sm:p-6">
              <button 
                onClick={() => setShowUpiQrModal(false)} 
                className="absolute right-3 top-3 rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30 transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 sm:h-12 sm:w-12">
                <QrCode className="h-5 w-5 text-white sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-lg font-bold text-white sm:text-xl">Scan & Pay</h3>
              <p className="mt-1 text-sm text-white/80">
                Use any UPI app to scan the QR code
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6">
              <div className="relative rounded-2xl bg-white p-3 shadow-lg ring-1 ring-slate-900/5 sm:p-4">
                <img
                  src={paymentData.upiQrCodeUrl}
                  alt="UPI Payment QR Code"
                  className="mx-auto h-48 w-48 sm:h-56 sm:w-56"
                />
              </div>
              
              <div className="mt-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 p-3 text-center sm:p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Pay Amount</p>
                <p className="mt-1 text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent sm:text-3xl">
                  {formatCurrency(paymentData.upiAmount || paymentData.amountInRupees)}
                </p>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-xs text-slate-500">UPI ID</p>
                <p className="font-mono text-sm font-medium text-slate-700">{paymentData.upiId}</p>
              </div>
              
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500 sm:mt-4">
                <Smartphone className="h-4 w-4" />
                <span>Google Pay, PhonePe, Paytm, etc.</span>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50 p-4">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setShowUpiQrModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

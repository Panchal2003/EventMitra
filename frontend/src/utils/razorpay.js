let razorpayScriptPromise;

export function loadRazorpayCheckout() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay checkout is only available in the browser."));
  }

  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout."));
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}

export async function openRazorpayCheckout(options) {
  console.log("Opening Razorpay checkout...");
  
  const Razorpay = await loadRazorpayCheckout();
  const amount = Number(options.amount);
  const key = String(options.key || "").trim();
  const orderId = String(options.order_id || "").trim();

  if (!key) {
    throw new Error("Razorpay key is missing");
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid amount");
  }
  if (!orderId) {
    throw new Error("Order ID is missing");
  }

  return new Promise((resolve, reject) => {
    const razorpayOptions = {
      key,
      amount,
      currency: options.currency || "INR",
      name: options.name || "EventMitra",
      description: options.description || "",
      order_id: orderId,
      prefill: options.prefill || {},
      theme: {
        color: options.theme?.color || "#0f766e"
      },
      handler: (response) => {
        console.log("Payment completed:", response.razorpay_payment_id);
        resolve({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature
        });
      },
    };

    console.log("Razorpay options:", {
      key: razorpayOptions.key,
      amount: razorpayOptions.amount,
      currency: razorpayOptions.currency,
      order_id: razorpayOptions.order_id,
      name: razorpayOptions.name,
      description: razorpayOptions.description,
    });

    const razorpay = new Razorpay(razorpayOptions);

    razorpay.on("modal.ondismiss", () => {
      console.log("Payment modal closed by user");
      reject(new Error("Payment modal closed by user"));
    });

    razorpay.on("payment.failed", (response) => {
      console.error("Payment failed:", response.error);
      reject(new Error(response.error?.description || response.error?.reason || "Payment failed"));
    });

    razorpay.open();
  });
}

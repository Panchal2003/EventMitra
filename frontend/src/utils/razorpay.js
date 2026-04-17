let razorpayScriptPromise;

export async function loadRazorpayCheckout() {
  console.log("Loading Razorpay checkout script...");
  
  if (typeof window === "undefined") {
    throw new Error("Razorpay only works in browser");
  }

  if (window.Razorpay) {
    console.log("Razorpay already loaded in window");
    return window.Razorpay;
  }

  if (razorpayScriptPromise) {
    console.log("Returning existing script promise");
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    
    script.onload = () => {
      console.log("Razorpay script loaded, window.Razorpay:", typeof window.Razorpay);
      if (window.Razorpay) {
        resolve(window.Razorpay);
      } else {
        reject(new Error("Razorpay not found after load"));
      }
    };
    
    script.onerror = (e) => {
      console.error("Failed to load Razorpay script:", e);
      razorpayScriptPromise = null;
      reject(new Error("Could not load payment system. Check your connection."));
    };
    
    document.body.appendChild(script);
    
    // Timeout fallback
    setTimeout(() => {
      if (window.Razorpay && !razorpayScriptPromise?.promiseSettled) {
        resolve(window.Razorpay);
      }
    }, 5000);
  });

  return razorpayScriptPromise;
}

export async function openRazorpayCheckout(options) {
  console.log("1. Starting Razorpay checkout", new Date().toISOString());
  
  let Razorpay;
  try {
    console.log("2. Loading Razorpay script...");
    Razorpay = await loadRazorpayCheckout();
    console.log("3. Razorpay loaded:", typeof Razorpay, window.Razorpay ? "available" : "NOT available");
  } catch (loadErr) {
    console.error("FAILED to load Razorpay:", loadErr);
    throw new Error("Unable to load payment system. Please refresh and try again.");
  }
  
  if (!Razorpay) {
    console.error("Razorpay is undefined after loading");
    throw new Error("Payment system not ready. Please refresh the page.");
  }
  
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
    console.log("Creating Razorpay checkout with options:", {
      key,
      amount,
      currency: options.currency || "INR",
      order_id: orderId,
      name: options.name,
      description: options.description,
    });
    
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
        console.log("Payment completed:", response);
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

    // Open the checkout
    try {
      razorpay.open();
    } catch (openError) {
      console.error("Failed to open Razorpay:", openError);
      reject(new Error(openError?.message || "Failed to open payment window"));
    }
  });
}

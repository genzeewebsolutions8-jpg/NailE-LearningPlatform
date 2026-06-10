/**
 * useRazorpay — custom hook to dynamically load Razorpay checkout SDK
 * and expose an openCheckout(options) function.
 */
export default function useRazorpay() {
    const loadScript = () => {
        return new Promise((resolve) => {
            if (document.getElementById("razorpay-sdk")) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.id = "razorpay-sdk";
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    /**
     * openCheckout — opens Razorpay checkout popup
     * @param {Object} opts
     * @param {string} opts.orderId
     * @param {number} opts.amount  in paise
     * @param {string} opts.currency
     * @param {string} opts.keyId
     * @param {string} opts.name
     * @param {string} opts.description
     * @param {string} opts.userEmail
     * @param {string} opts.userContact
     * @param {Function} opts.onSuccess(response)
     * @param {Function} opts.onFailure(error)
     */
    const openCheckout = async (opts) => {
        const loaded = await loadScript();
        if (!loaded) {
            alert("Razorpay SDK failed to load. Please check your internet connection.");
            return;
        }

        const options = {
            key: opts.keyId,
            amount: opts.amount,
            currency: opts.currency || "INR",
            name: "Nail Academy",
            description: opts.description || opts.name,
            image: "/logo.jpg",
            order_id: opts.orderId,
            prefill: {
                email: opts.userEmail || "",
                contact: opts.userContact || "",
            },
            theme: {
                color: "#C58B86",  // matches --primary
            },
            handler: (response) => {
                if (opts.onSuccess) opts.onSuccess(response);
            },
            modal: {
                ondismiss: () => {
                    if (opts.onFailure) opts.onFailure(new Error("Payment cancelled by user"));
                },
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response) => {
            if (opts.onFailure) opts.onFailure(response.error);
        });
        rzp.open();
    };

    return { openCheckout };
}

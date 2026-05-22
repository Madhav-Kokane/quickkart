import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { clearCart, selectCartTotal } from "../store/slices/cartSlice";
import {
  createRazorpayOrder,
  verifyPayment,
  placeOrder,
} from "../api/orderApi";

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const items = useSelector((s) => s.cart.items);
  const total = useSelector(selectCartTotal);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    address: user?.address || "",
    phone: user?.phone || "",
    pincode: user?.pincode || "",
  });

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handlePayment = async () => {
    if (!form.address || !form.phone || !form.pincode) {
      return toast.error("Please fill all delivery details");
    }
    if (items.length === 0) {
      return toast.error("Your cart is empty");
    }

    setLoading(true);
    try {
      // 1. Create Razorpay order on backend
      const { data: rpData } = await createRazorpayOrder(total);

      // 2. Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: rpData.order.amount,
        currency: "INR",
        name: "QuickKart",
        description: "Grocery Order",
        order_id: rpData.order.id,
        prefill: {
          name: user.name,
          email: user.email,
          contact: form.phone,
        },
        theme: { color: "#0C9A56" },

        handler: async (response) => {
          try {
            // 3. Verify payment signature
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // 4. Create order in DB
            const orderItems = items.map((i) => ({
              product: i._id,
              name: i.name,
              image: i.images?.[0] || "",
              price: i.discountedPrice,
              qty: i.qty,
            }));

            const { data } = await placeOrder({
              items: orderItems,
              address: form.address,
              pincode: form.pincode,
              phone: form.phone,
              totalAmount: total,
              paymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
            });

            // 5. Clear cart and redirect to tracking
            dispatch(clearCart());
            toast.success("Order placed successfully! 🎉");
            navigate(`/orders/${data.order._id}`);
          } catch (err) {
            toast.error("Order confirmation failed. Contact support.");
          }
        },

        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled");
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-xl font-semibold text-gray-700">
            Your cart is empty
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-primary text-white px-6 py-2 rounded-xl font-medium"
          >
            Shop now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="text-gray-500 hover:text-gray-800"
        >
          ←
        </button>
        <h1 className="text-lg font-bold">Checkout</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Delivery details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            📍 Delivery Details
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Full address
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={2}
                placeholder="House no, Street, Area..."
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  type="tel"
                  placeholder="10-digit number"
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Pincode
                </label>
                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  type="text"
                  placeholder="411001"
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-800 mb-4">🧾 Order Summary</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item._id} className="flex items-center gap-3">
                <img
                  src={item.images?.[0] || "https://via.placeholder.com/50"}
                  alt={item.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    x{item.qty} · {item.unit}
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  ₹{item.discountedPrice * item.qty}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)
              </span>
              <span>₹{total}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Delivery fee</span>
              <span className="text-green-600 font-medium">FREE</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
        </div>

        {/* Pay button */}
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl text-base hover:bg-primary/90 transition-colors disabled:opacity-60 shadow-lg shadow-primary/30"
        >
          {loading ? "Opening payment..." : `Pay ₹${total} with Razorpay`}
        </button>

        <p className="text-center text-xs text-gray-400">
          🔒 Secured by Razorpay · Test mode active
        </p>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyOrders } from "../api/orderApi";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  placed: "bg-blue-100 text-blue-700",
  confirmed: "bg-yellow-100 text-yellow-700",
  picked: "bg-orange-100 text-orange-700",
  dispatched: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders()
      .then(({ data }) => setOrders(data.orders))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-800 mb-5">My Orders</h1>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl h-28 animate-pulse border border-gray-100"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-medium">No orders yet</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 bg-primary text-white px-6 py-2 rounded-xl text-sm font-medium"
            >
              Start shopping
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={() => navigate(`/orders/${order._id}`)}
                className="bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-800">
                    Order #{order._id.slice(-6).toUpperCase()}
                  </p>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[order.status]}`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  {order.items.length} items · ₹{order.totalAmount}
                </p>
                <div className="flex gap-2 overflow-hidden">
                  {order.items.slice(0, 4).map((item, i) => (
                    <img
                      key={i}
                      src={item.image || "https://via.placeholder.com/40"}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                    />
                  ))}
                  {order.items.length > 4 && (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

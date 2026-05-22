import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { fetchAssignedOrders, updateOrderStatus } from "../api/orderApi";
import { getSocket } from "../socket";

const STATUS_FLOW = {
  confirmed: {
    next: "picked",
    label: "Mark as Picked Up",
    emoji: "📦",
    color: "bg-orange-500",
  },
  picked: {
    next: "dispatched",
    label: "Mark as Dispatched",
    emoji: "🚴",
    color: "bg-purple-500",
  },
  dispatched: {
    next: "delivered",
    label: "Mark as Delivered",
    emoji: "✅",
    color: "bg-green-500",
  },
};

const STATUS_BADGE = {
  confirmed: "bg-yellow-100 text-yellow-700",
  picked: "bg-orange-100 text-orange-700",
  dispatched: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100  text-green-700",
};

export default function AgentDashboard() {
  const { user } = useSelector((s) => s.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState({}); // orderId -> bool (is sharing location)

  // Load assigned orders
  const loadOrders = async () => {
    try {
      const { data } = await fetchAssignedOrders();
      setOrders(data.orders);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    // Join agent's personal socket room
    const socket = getSocket();
    socket.emit("join-agent-room", user._id);

    // Listen for new assignments from admin
    socket.on("new-assignment", (data) => {
      toast.success(`New order assigned! 📦 ${data.items} items`);
      loadOrders(); // refresh list
    });

    return () => socket.off("new-assignment");
  }, []);

  // Update order status
  const handleStatusUpdate = async (orderId, nextStatus) => {
    try {
      await updateOrderStatus(orderId, nextStatus);
      setOrders((prev) =>
        nextStatus === "delivered"
          ? prev.filter((o) => o._id !== orderId)
          : prev.map((o) =>
              o._id === orderId ? { ...o, status: nextStatus } : o,
            ),
      );
      toast.success(`Order marked as ${nextStatus}!`);

      // Stop location sharing when delivered
      if (nextStatus === "delivered") {
        stopLocationSharing(orderId);
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  // Start sharing GPS location for an order
  const startLocationSharing = (orderId) => {
    if (!navigator.geolocation) {
      return toast.error("Geolocation not supported on this device");
    }

    const socket = getSocket();

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        socket.emit("agent-location", {
          orderId,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => toast.error("Location error: " + err.message),
      { enableHighAccuracy: true, maximumAge: 5000 },
    );

    // Store watchId so we can stop it later
    setTracking((prev) => ({ ...prev, [orderId]: watchId }));
    toast.success("Live location sharing started 📡");
  };

  // Stop sharing GPS location
  const stopLocationSharing = (orderId) => {
    const watchId = tracking[orderId];
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setTracking((prev) => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });
      toast.success("Location sharing stopped");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-bold text-gray-800">
            ⚡ QuickKart Agent
          </h1>
          <p className="text-xs text-gray-500">Hi, {user?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-600 font-medium">Online</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Assigned", value: orders.length, color: "text-blue-600" },
            {
              label: "Dispatched",
              value: orders.filter((o) => o.status === "dispatched").length,
              color: "text-purple-600",
            },
            { label: "Delivered", value: "—", color: "text-green-600" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-gray-100 p-3 text-center"
            >
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <h2 className="font-bold text-gray-800 mb-3">
          Active Orders {orders.length > 0 && `(${orders.length})`}
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl h-48 animate-pulse border border-gray-100"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-3">😴</p>
            <p className="font-medium">No orders assigned yet</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const flow = STATUS_FLOW[order.status];
              const isTracking = !!tracking[order._id];

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
                >
                  {/* Order header */}
                  <div className="px-4 pt-4 pb-3 border-b border-gray-50">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-800">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_BADGE[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* Customer info */}
                  <div className="px-4 py-3 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                        👤
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">
                          {order.customer?.name}
                        </p>
                        <p className="text-xs text-gray-500">{order.address}</p>
                      </div>
                      <a
                        href={`tel:${order.phone}`}
                        className="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-xl text-xs font-semibold"
                      >
                        📞 Call
                      </a>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                      {order.items.length} ITEMS · ₹{order.totalAmount} COD
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {order.items.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2 py-1"
                        >
                          <img
                            src={item.image || "https://via.placeholder.com/24"}
                            alt={item.name}
                            className="w-6 h-6 rounded object-cover"
                          />
                          <span className="text-xs text-gray-700">
                            {item.name} x{item.qty}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-4 py-3 space-y-2">
                    {/* Location sharing toggle */}
                    {order.status === "dispatched" && (
                      <button
                        onClick={() =>
                          isTracking
                            ? stopLocationSharing(order._id)
                            : startLocationSharing(order._id)
                        }
                        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2
                          ${
                            isTracking
                              ? "bg-red-50 text-red-600 border border-red-200"
                              : "bg-blue-50 text-blue-600 border border-blue-200"
                          }`}
                      >
                        {isTracking
                          ? "⏹ Stop Location Sharing"
                          : "📡 Share Live Location"}
                      </button>
                    )}

                    {/* Status update button */}
                    {flow && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, flow.next)}
                        className={`w-full py-3 rounded-xl text-white font-bold text-sm transition-colors ${flow.color} hover:opacity-90`}
                      >
                        {flow.emoji} {flow.label}
                      </button>
                    )}

                    {order.status === "delivered" && (
                      <div className="text-center py-2 text-green-600 font-semibold text-sm">
                        ✅ Delivered successfully!
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

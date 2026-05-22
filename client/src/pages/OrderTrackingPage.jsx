import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchOrderById } from "../api/orderApi";
import { getSocket } from "../socket";
import toast from "react-hot-toast";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon broken in Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const STEPS = [
  { key: "placed", label: "Order Placed", emoji: "📋" },
  { key: "confirmed", label: "Confirmed", emoji: "✅" },
  { key: "picked", label: "Picked Up", emoji: "📦" },
  { key: "dispatched", label: "On the Way", emoji: "🚴" },
  { key: "delivered", label: "Delivered", emoji: "🎉" },
];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null); // DOM node
  const leafletMap = useRef(null); // Leaflet map instance
  const agentMarker = useRef(null); // Leaflet marker instance

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agentPos, setAgentPos] = useState(null);

  const stepIndex = (status) => STEPS.findIndex((s) => s.key === status);

  // Init Leaflet map at given coords
  const initLeafletMap = (lat, lng) => {
    if (leafletMap.current || !mapRef.current) return;

    const map = L.map(mapRef.current).setView([lat, lng], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Blue agent marker
    const blueIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    agentMarker.current = L.marker([lat, lng], { icon: blueIcon })
      .addTo(map)
      .bindPopup("🚴 Delivery Agent")
      .openPopup();

    leafletMap.current = map;
  };

  // Move marker smoothly to new position
  const updateAgentPosition = (lat, lng) => {
    if (!leafletMap.current) {
      initLeafletMap(lat, lng);
      return;
    }
    agentMarker.current?.setLatLng([lat, lng]);
    leafletMap.current?.panTo([lat, lng]);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchOrderById(id);
        setOrder(data.order);
      } catch {
        toast.error("Order not found");
      } finally {
        setLoading(false);
      }
    };
    load();

    const socket = getSocket();
    socket.emit("join-order-room", id);

    socket.on("order-status-update", ({ status }) => {
      setOrder((prev) => ({ ...prev, status }));
      const step = STEPS.find((s) => s.key === status);
      toast.success(`${step?.emoji} ${step?.label}!`);
    });

    socket.on("agent-location", ({ lat, lng }) => {
      setAgentPos({ lat, lng });
      updateAgentPosition(lat, lng);
    });

    return () => {
      socket.off("order-status-update");
      socket.off("agent-location");
      // Cleanup Leaflet map on unmount
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );

  if (!order) return null;

  const currentStep = stepIndex(order.status);
  const isDispatched = order.status === "dispatched";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => navigate("/orders")}
          className="text-gray-500 hover:text-gray-800 text-xl"
        >
          ←
        </button>
        <h1 className="text-lg font-bold">Track Order</h1>
        <span className="ml-auto text-xs text-gray-400">
          #{order._id.slice(-6).toUpperCase()}
        </span>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Status banner */}
        <div
          className={`rounded-2xl p-5 text-white text-center
          ${order.status === "delivered" ? "bg-green-500" : "bg-primary"}`}
        >
          <p className="text-4xl mb-2">{STEPS[currentStep]?.emoji}</p>
          <p className="text-xl font-bold">{STEPS[currentStep]?.label}</p>
          {isDispatched && (
            <p className="text-sm mt-2 bg-white/20 rounded-lg px-3 py-1 inline-block animate-pulse">
              📡 Agent is on the way — live tracking active
            </p>
          )}
          {order.status === "delivered" && (
            <p className="text-sm mt-2 bg-white/20 rounded-lg px-3 py-1 inline-block">
              Thank you for shopping with QuickKart! 🙏
            </p>
          )}
        </div>

        {/* Live map — shown when dispatched */}
        {isDispatched && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="font-semibold text-gray-800 text-sm">
                Live Agent Location
              </p>
              {agentPos && (
                <span className="ml-auto text-xs text-gray-400">
                  {agentPos.lat.toFixed(4)}, {agentPos.lng.toFixed(4)}
                </span>
              )}
            </div>

            {/* Map renders here */}
            <div ref={mapRef} className="w-full h-56" style={{ zIndex: 0 }} />

            {/* Waiting state — shown before agent shares location */}
            {!agentPos && (
              <div className="h-56 bg-gray-50 flex items-center justify-center -mt-56 relative z-10 pointer-events-none">
                <div className="text-center text-gray-400">
                  <p className="text-3xl mb-2">🗺️</p>
                  <p className="text-sm font-medium">
                    Waiting for agent location
                  </p>
                  <p className="text-xs mt-1">
                    Map appears when agent taps Share Location
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress stepper */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-800 mb-5">Order Progress</h2>
          <div className="relative">
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100" />
            <div className="space-y-5">
              {STEPS.map((step, i) => {
                const done = i <= currentStep;
                const current = i === currentStep;
                return (
                  <div
                    key={step.key}
                    className="flex items-center gap-4 relative"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 z-10 border-2 transition-all
                      ${
                        done
                          ? "bg-primary border-primary text-white"
                          : "bg-white border-gray-200 text-gray-400"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-medium text-sm ${done ? "text-gray-900" : "text-gray-400"}`}
                      >
                        {step.emoji} {step.label}
                      </p>
                      {current && order.status !== "delivered" && (
                        <p className="text-xs text-primary font-medium animate-pulse mt-0.5">
                          In progress...
                        </p>
                      )}
                    </div>
                    {current && order.status !== "delivered" && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        Live
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Agent info */}
        {order.assignedAgent && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-800 mb-3">
              🚴 Your Delivery Agent
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-xl">
                🧑
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {order.assignedAgent.name}
                </p>
                <p className="text-sm text-gray-500">
                  {order.assignedAgent.phone}
                </p>
              </div>
              <a
                href={`tel:${order.assignedAgent.phone}`}
                className="ml-auto bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium"
              >
                📞 Call
              </a>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-800 mb-3">🧾 Items</h2>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <img
                  src={item.image || "https://via.placeholder.com/50"}
                  alt={item.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-400">x{item.qty}</p>
                </div>
                <p className="text-sm font-semibold">
                  ₹{item.price * item.qty}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

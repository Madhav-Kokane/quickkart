import { useEffect, useState } from "react";
import {
  fetchAdminOrders,
  fetchAdminAgents,
  assignAgentToOrder,
  updateOrderStatus,
} from "../../api/adminApi";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  placed: "bg-blue-100   text-blue-700",
  confirmed: "bg-yellow-100 text-yellow-700",
  picked: "bg-orange-100 text-orange-700",
  dispatched: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100  text-green-700",
  cancelled: "bg-red-100    text-red-700",
};

const ALL_STATUSES = [
  "all",
  "placed",
  "confirmed",
  "picked",
  "dispatched",
  "delivered",
  "cancelled",
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [assigning, setAssigning] = useState({});

  const loadData = async () => {
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const [ordersRes, agentsRes] = await Promise.all([
        fetchAdminOrders(params),
        fetchAdminAgents(),
      ]);
      setOrders(ordersRes.data.orders);
      setAgents(agentsRes.data.agents);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  const handleAssign = async (orderId, agentId) => {
    if (!agentId) return toast.error("Please select an agent");
    setAssigning((p) => ({ ...p, [orderId]: true }));
    try {
      await assignAgentToOrder(orderId, agentId);
      toast.success("Agent assigned & order confirmed!");
      loadData();
    } catch {
      toast.error("Failed to assign agent");
    } finally {
      setAssigning((p) => ({ ...p, [orderId]: false }));
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Status updated to ${status}`);
      loadData();
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setFilter(s);
              setLoading(true);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all border
              ${
                filter === s
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-600 border-gray-200 hover:border-primary"
              }`}
          >
            {s === "all" ? "🔎 All" : s}
          </button>
        ))}
      </div>

      {/* Orders count */}
      <p className="text-sm text-gray-500">{orders.length} orders found</p>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl h-24 animate-pulse border border-gray-100"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400">
          <p className="text-3xl mb-2">📭</p>
          <p>No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            >
              {/* Order row */}
              <div
                className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() =>
                  setExpanded(expanded === order._id ? null : order._id)
                }
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800 text-sm">
                      #{order._id.slice(-6).toUpperCase()}
                    </p>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[order.status]}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {order.customer?.name} · {order.items.length} items · ₹
                    {order.totalAmount}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
                <span className="text-gray-400 text-sm">
                  {expanded === order._id ? "▲" : "▼"}
                </span>
              </div>

              {/* Expanded detail */}
              {expanded === order._id && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-gray-50">
                  {/* Customer & address */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-1">
                        CUSTOMER
                      </p>
                      <p className="font-medium text-gray-800">
                        {order.customer?.name}
                      </p>
                      <p className="text-gray-500">{order.customer?.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-1">
                        DELIVERY
                      </p>
                      <p className="text-gray-700">{order.address}</p>
                      <p className="text-gray-500">📍 {order.pincode}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-2">
                      ITEMS
                    </p>
                    <div className="space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <img
                            src={item.image || "https://via.placeholder.com/40"}
                            alt={item.name}
                            className="w-9 h-9 rounded-lg object-cover"
                          />
                          <span className="text-sm text-gray-700 flex-1">
                            {item.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            x{item.qty}
                          </span>
                          <span className="text-sm font-semibold">
                            ₹{item.price * item.qty}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assigned agent */}
                  {order.assignedAgent && (
                    <div className="bg-green-50 rounded-xl px-4 py-2.5 flex items-center gap-2">
                      <span>🚴</span>
                      <span className="text-sm font-medium text-green-800">
                        {order.assignedAgent.name}
                      </span>
                      <span className="text-xs text-green-600 ml-auto">
                        {order.assignedAgent.phone}
                      </span>
                    </div>
                  )}

                  {/* Assign agent — only for placed orders */}
                  {order.status === "placed" && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-2">
                        ASSIGN AGENT
                      </p>
                      <div className="flex gap-2">
                        <select
                          id={`agent-${order._id}`}
                          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Select agent...
                          </option>
                          {agents.map((a) => (
                            <option key={a._id} value={a._id}>
                              {a.name} · {a.phone}
                            </option>
                          ))}
                        </select>
                        <button
                          disabled={assigning[order._id]}
                          onClick={() => {
                            const sel = document.getElementById(
                              `agent-${order._id}`,
                            );
                            handleAssign(order._id, sel.value);
                          }}
                          className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-60"
                        >
                          {assigning[order._id] ? "..." : "Assign"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Manual status override */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-2">
                      UPDATE STATUS
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        "confirmed",
                        "picked",
                        "dispatched",
                        "delivered",
                        "cancelled",
                      ]
                        .filter((s) => s !== order.status)
                        .map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(order._id, s)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all
                              ${
                                s === "cancelled"
                                  ? "border-red-200 text-red-600 hover:bg-red-50"
                                  : "border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                              }`}
                          >
                            {s}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

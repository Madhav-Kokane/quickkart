import { useEffect, useState } from "react";
import { fetchAdminStats } from "../../api/adminApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";

const StatCard = ({ emoji, label, value, sub, color }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5">
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${color}`}
    >
      {emoji}
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats()
      .then(({ data }) => setStats(data.stats))
      .catch(() => toast.error("Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl h-32 animate-pulse border border-gray-100"
          />
        ))}
      </div>
    );

  if (!stats) return null;

  // Format revenue chart data
  const chartData = stats.revenueData.map((d) => ({
    date: new Date(d._id).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
    revenue: d.revenue,
    orders: d.orders,
  }));

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          emoji="📦"
          label="Total Orders"
          value={stats.totalOrders}
          color="bg-blue-50"
        />
        <StatCard
          emoji="🕐"
          label="Pending Orders"
          value={stats.pendingOrders}
          color="bg-amber-50"
          sub="placed + in transit"
        />
        <StatCard
          emoji="✅"
          label="Delivered"
          value={stats.deliveredOrders}
          color="bg-green-50"
        />
        <StatCard
          emoji="📅"
          label="Today's Orders"
          value={stats.todayOrders}
          color="bg-purple-50"
        />
        <StatCard
          emoji="💰"
          label="Today's Revenue"
          value={`₹${stats.todayRevenue}`}
          color="bg-green-50"
        />
        <StatCard
          emoji="🏪"
          label="Total Products"
          value={stats.totalProducts}
          color="bg-blue-50"
        />
        <StatCard
          emoji="🚴"
          label="Agents"
          value={stats.totalAgents}
          color="bg-purple-50"
        />
        <StatCard
          emoji="⚠️"
          label="Low Stock"
          value={stats.lowStockProducts}
          color="bg-red-50"
          sub="stock < 5 units"
        />
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-gray-800 mb-1">Revenue — Last 7 Days</h2>
        <p className="text-xs text-gray-400 mb-5">
          Only delivered orders are counted
        </p>

        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-3xl mb-2">📊</p>
              <p className="text-sm">No delivered orders yet</p>
              <p className="text-xs mt-1">
                Complete some orders to see revenue data
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                formatter={(value) => [`₹${value}`, "Revenue"]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                }}
              />
              <Bar dataKey="revenue" fill="#0C9A56" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

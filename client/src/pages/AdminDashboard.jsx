import { useState } from "react";
import AdminStats from "../components/admin/AdminStats";
import AdminOrders from "../components/admin/AdminOrders";
import AdminInventory from "../components/admin/AdminInventory";
import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const TABS = [
  { key: "stats", label: "Dashboard", emoji: "📊" },
  { key: "orders", label: "Orders", emoji: "📦" },
  { key: "inventory", label: "Inventory", emoji: "🏪" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("stats");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <div>
              <h1 className="font-bold text-gray-800 leading-tight">
                QuickKart Admin
              </h1>
              <p className="text-xs text-gray-400">Control Panel</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Tab bar */}
        <div className="max-w-6xl mx-auto px-4 flex gap-1 pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all
                ${
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === "stats" && <AdminStats />}
        {activeTab === "orders" && <AdminOrders />}
        {activeTab === "inventory" && <AdminInventory />}
      </div>
    </div>
  );
}

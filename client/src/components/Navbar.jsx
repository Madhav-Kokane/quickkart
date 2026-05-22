import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import { selectCartCount } from "../store/slices/cartSlice";
import CartSidebar from "./CartSidebar";
import toast from "react-hot-toast";

export default function Navbar({ onSearch }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const cartCount = useSelector(selectCartCount);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out");
    navigate("/login");
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <h1
            onClick={() => navigate("/")}
            className="text-xl font-bold text-primary cursor-pointer whitespace-nowrap"
          >
            ⚡ QuickKart
          </h1>

          {/* Search */}
          <div className="flex-1 max-w-xl">
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search groceries..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Pincode badge */}
            {user?.pincode && (
              <span className="hidden sm:flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                📍 {user.pincode}
              </span>
            )}

            {/* Admin link */}
            {user?.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="text-sm text-primary font-medium hover:underline hidden sm:block"
              >
                Admin
              </button>
            )}

            {/* My Orders — only for customers */}
{user?.role === 'customer' && (
  <button
    onClick={() => navigate('/orders')}
    className="text-sm text-gray-600 hover:text-primary font-medium hidden sm:block"
  >
    My Orders
  </button>
)}

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              🛒 Cart
              {cartCount > 0 && (
                <span className="bg-secondary text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User menu */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 hidden sm:block">
                Hi, {user?.name?.split(" ")[0]}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

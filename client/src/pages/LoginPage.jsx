import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { setCredentials } from "../store/slices/authSlice";
import { loginUser } from "../api/authApi";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      dispatch(setCredentials({ user: data.user, token: data.token }));
      toast.success(`Welcome back, ${data.user.name}!`);

      if (data.user.role === "admin") return navigate("/admin");
      if (data.user.role === "agent") return navigate("/agent");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Demo login helper
  const fillDemo = (email, password) => setForm({ email, password });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">QuickKart</h1>
          <p className="text-gray-500 text-sm mt-1">Groceries in 10 minutes</p>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-6">Login</h2>

        {/* Demo credentials — great for interviews */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 space-y-1">
          <p className="text-xs font-semibold text-amber-800 mb-2">
            Demo accounts
          </p>
          <button
            onClick={() => fillDemo("admin@quickkart.com", "admin123")}
            className="text-xs text-amber-700 hover:underline block"
          >
            Admin → admin@quickkart.com / admin123
          </button>
          <button
            onClick={() => fillDemo("agent@quickkart.com", "agent123")}
            className="text-xs text-amber-700 hover:underline block"
          >
            Agent → agent@quickkart.com / agent123
          </button>
          <button
            onClick={() => fillDemo("customer@quickkart.com", "cust123")}
            className="text-xs text-amber-700 hover:underline block"
          >
            Customer → customer@quickkart.com / cust123
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@email.com"
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg py-3 text-sm transition-all disabled:opacity-60 mt-2"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          New here?{" "}
          <Link
            to="/register"
            className="text-primary font-medium hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

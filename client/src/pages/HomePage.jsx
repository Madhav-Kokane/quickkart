import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { fetchProducts } from "../api/productApi";
import { CATEGORIES } from "../utils/categories";
import toast from "react-hot-toast";

export default function HomePage() {
  const { user } = useSelector((s) => s.auth);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const loadProducts = async (cat, q) => {
    setLoading(true);
    try {
      const params = { pincode: user?.pincode };
      if (cat && cat !== "all") params.category = cat;
      if (q) params.search = q;
      const { data } = await fetchProducts(params);
      setProducts(data.products);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(category, search);
  }, [category]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => loadProducts(category, search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSearch={setSearch} />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Hero banner */}
        <div className="bg-gradient-to-r from-primary to-green-400 rounded-2xl p-6 mb-6 text-white">
          <p className="text-sm font-medium opacity-90">
            Delivering to 📍 {user?.pincode}
          </p>
          <h2 className="text-2xl font-bold mt-1">Groceries in 10 minutes</h2>
          <p className="text-sm opacity-80 mt-1">
            Fresh produce · Daily essentials · Free delivery
          </p>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border
                ${
                  category === cat.value
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium">No products found</p>
            <p className="text-sm mt-1">
              Try a different category or search term
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {products.length} items found
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

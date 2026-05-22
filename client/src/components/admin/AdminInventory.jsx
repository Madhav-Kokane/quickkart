import { useEffect, useState } from "react";
import {
  fetchAdminProducts,
  updateProduct,
  deleteProduct,
  createProduct,
} from "../../api/adminApi";
import { CATEGORIES } from "../../utils/categories";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  discountedPrice: "",
  category: "fruits",
  stock: "",
  unit: "pcs",
  pincode: "",
};

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const loadProducts = async () => {
    try {
      const { data } = await fetchAdminProducts();
      setProducts(data.products);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      discountedPrice: product.discountedPrice,
      category: product.category,
      stock: product.stock,
      unit: product.unit,
      pincode: product.pincode,
    });
    setEditId(product._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (
      !form.name ||
      !form.price ||
      !form.discountedPrice ||
      !form.stock ||
      !form.pincode
    ) {
      return toast.error("Please fill all required fields");
    }
    setSaving(true);
    try {
      if (editId) {
        await updateProduct(editId, form);
        toast.success("Product updated!");
      } else {
        await createProduct(form);
        toast.success("Product created!");
      }
      setShowForm(false);
      loadProducts();
    } catch {
      toast.error("Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailable = async (product) => {
    try {
      await updateProduct(product._id, { isAvailable: !product.isAvailable });
      toast.success(
        product.isAvailable
          ? "Product hidden from customers"
          : "Product visible to customers",
      );
      loadProducts();
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      loadProducts();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleStockUpdate = async (id, newStock) => {
    try {
      await updateProduct(id, { stock: Number(newStock) });
      toast.success("Stock updated");
      setProducts((p) =>
        p.map((pr) =>
          pr._id === id ? { ...pr, stock: Number(newStock) } : pr,
        ),
      );
    } catch {
      toast.error("Failed to update stock");
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex gap-3 items-center flex-wrap">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          onClick={openAdd}
          className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 whitespace-nowrap"
        >
          + Add Product
        </button>
      </div>

      <p className="text-sm text-gray-500">{filtered.length} products</p>

      {/* Add / Edit form */}
      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-primary/30 p-5 space-y-3">
          <h3 className="font-bold text-gray-800">
            {editId ? "✏️ Edit Product" : "➕ Add New Product"}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600">
                Product name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Fresh Bananas"
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600">
                Description
              </label>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Short description"
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">
                MRP (₹) *
              </label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                placeholder="100"
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">
                Sale price (₹) *
              </label>
              <input
                name="discountedPrice"
                type="number"
                value={form.discountedPrice}
                onChange={handleChange}
                placeholder="85"
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              >
                {CATEGORIES.filter((c) => c.value !== "all").map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.emoji} {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Unit</label>
              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              >
                {["pcs", "kg", "L", "dozen", "g", "ml"].map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">
                Stock *
              </label>
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                placeholder="50"
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">
                Pincode *
              </label>
              <input
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                placeholder="411033"
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? "Saving..." : editId ? "Save Changes" : "Add Product"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Product list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl h-20 animate-pulse border border-gray-100"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((product) => (
            <div
              key={product._id}
              className={`bg-white rounded-2xl border overflow-hidden transition-all
                ${!product.isAvailable ? "opacity-60 border-gray-100" : "border-gray-100"}`}
            >
              <div className="flex items-center gap-4 px-4 py-3">
                {/* Image */}
                <img
                  src={product.images?.[0] || "https://via.placeholder.com/48"}
                  alt={product.name}
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {product.name}
                    </p>
                    {!product.isAvailable && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        Hidden
                      </span>
                    )}
                    {product.stock < 5 && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                        Low stock
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 capitalize">
                    {product.category} · {product.unit}
                  </p>
                  <p className="text-sm font-bold text-primary mt-0.5">
                    ₹{product.discountedPrice}
                    <span className="text-xs text-gray-400 line-through ml-1">
                      ₹{product.price}
                    </span>
                  </p>
                </div>

                {/* Stock editor */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <label className="text-xs text-gray-400">Stock</label>
                  <input
                    type="number"
                    defaultValue={product.stock}
                    onBlur={(e) => {
                      if (Number(e.target.value) !== product.stock)
                        handleStockUpdate(product._id, e.target.value);
                    }}
                    className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleToggleAvailable(product)}
                    title={
                      product.isAvailable
                        ? "Hide from customers"
                        : "Show to customers"
                    }
                    className={`p-2 rounded-lg text-sm transition-colors
                      ${
                        product.isAvailable
                          ? "text-green-600 hover:bg-green-50"
                          : "text-gray-400 hover:bg-gray-50"
                      }`}
                  >
                    {product.isAvailable ? "👁" : "🚫"}
                  </button>
                  <button
                    onClick={() => openEdit(product)}
                    className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 text-sm transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-50 text-sm transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

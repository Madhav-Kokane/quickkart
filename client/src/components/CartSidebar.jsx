import { useSelector, useDispatch } from "react-redux";
import {
  removeItem,
  updateQty,
  clearCart,
  selectCartTotal,
} from "../store/slices/cartSlice";
import { useNavigate } from "react-router-dom";

export default function CartSidebar({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((s) => s.cart.items);
  const total = useSelector(selectCartTotal);

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-bold text-lg">My Cart 🛒</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <span className="text-5xl mb-3">🛒</span>
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm mt-1">Add items to get started</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item._id}
                className="flex gap-3 items-center bg-gray-50 rounded-xl p-3"
              >
                <img
                  src={item.images?.[0] || "https://via.placeholder.com/60"}
                  alt={item.name}
                  className="w-14 h-14 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-400">{item.unit}</p>
                  <p className="text-sm font-bold text-primary mt-0.5">
                    ₹{item.discountedPrice}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center bg-primary rounded-lg overflow-hidden">
                    <button
                      onClick={() =>
                        item.qty === 1
                          ? dispatch(removeItem(item._id))
                          : dispatch(
                              updateQty({ id: item._id, qty: item.qty - 1 }),
                            )
                      }
                      className="px-2 py-1 text-white font-bold hover:bg-primary/80"
                    >
                      −
                    </button>
                    <span className="px-2 text-white text-sm font-semibold">
                      {item.qty}
                    </span>
                    <button
                      onClick={() =>
                        dispatch(updateQty({ id: item._id, qty: item.qty + 1 }))
                      }
                      className="px-2 py-1 text-white font-bold hover:bg-primary/80"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    ₹{item.discountedPrice * item.qty}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t px-5 py-4 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold">₹{total}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Delivery</span>
              <span className="text-green-600 font-semibold">FREE</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base border-t pt-3">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Proceed to Checkout →
            </button>
            <button
              onClick={() => dispatch(clearCart())}
              className="w-full text-red-400 text-sm hover:text-red-600 transition-colors"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}

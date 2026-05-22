import { useDispatch, useSelector } from 'react-redux';
import { addItem, removeItem, updateQty } from '../store/slices/cartSlice';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const cartItem = useSelector((state) =>
    state.cart.items.find((i) => i._id === product._id)
  );

  const discount = Math.round(
    ((product.price - product.discountedPrice) / product.price) * 100
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative h-40 bg-gray-50 overflow-hidden">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {discount}% OFF
          </span>
        )}
        {product.stock < 5 && product.stock > 0 && (
          <span className="absolute top-2 right-2 bg-orange-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Only {product.stock} left
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-gray-400 capitalize mb-0.5">{product.unit}</p>
        <h3 className="font-semibold text-gray-800 text-sm leading-tight mb-2 truncate">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <span className="font-bold text-gray-900">₹{product.discountedPrice}</span>
          {discount > 0 && (
            <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
          )}
        </div>

        {/* Add to cart */}
        {product.stock === 0 ? (
          <button disabled className="w-full py-2 rounded-xl text-sm bg-gray-100 text-gray-400 cursor-not-allowed">
            Out of stock
          </button>
        ) : !cartItem ? (
          <button
            onClick={() => dispatch(addItem(product))}
            className="w-full py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Add
          </button>
        ) : (
          <div className="flex items-center justify-between bg-primary rounded-xl overflow-hidden">
            <button
              onClick={() =>
                cartItem.qty === 1
                  ? dispatch(removeItem(product._id))
                  : dispatch(updateQty({ id: product._id, qty: cartItem.qty - 1 }))
              }
              className="px-4 py-2 text-white font-bold text-lg hover:bg-primary/80 transition-colors"
            >
              −
            </button>
            <span className="text-white font-semibold text-sm">{cartItem.qty}</span>
            <button
              onClick={() =>
                cartItem.qty < product.stock
                  ? dispatch(updateQty({ id: product._id, qty: cartItem.qty + 1 }))
                  : null
              }
              className="px-4 py-2 text-white font-bold text-lg hover:bg-primary/80 transition-colors"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
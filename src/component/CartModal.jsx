import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function CartModal() {
  const { cartModal, closeCartModal, cartTotal, cartItems } = useStore();
  const navigate = useNavigate();

  if (!cartModal) return null;

  const { item } = cartModal;

  const handleViewCart = () => {
    closeCartModal();
    navigate("/cart");
  };

  const handleContinue = () => {
    closeCartModal();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[9998]"
        onClick={handleContinue}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] bg-white rounded-xl shadow-2xl w-[90vw] max-w-lg p-6">

        {/* Close */}
        <button
          onClick={handleContinue}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Success message */}
        <div className="flex items-center gap-2 mb-5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-green-600 font-semibold text-base">
            Item(s) added to cart
          </span>
        </div>

        {/* Item row */}
        <div className="flex items-start gap-4 border border-gray-100 rounded-lg p-3 bg-gray-50 mb-5">
          <img
            src={item.image}
            alt={item.name}
            className="w-20 h-20 object-contain bg-white border border-gray-200 rounded-lg p-1 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm leading-snug">{item.name}</p>
            {item.size && (
              <p className="text-xs text-gray-500 mt-1">Size: {item.size}</p>
            )}
            {item.color && (
              <p className="text-xs text-gray-500">Color: {item.color}</p>
            )}
            {item.design && (
              <p className="text-xs text-gray-500">Design: {item.design}</p>
            )}
          </div>
        </div>

        {/* Subtotal */}
        <div className="flex items-center justify-between mb-1 text-sm">
          <span className="font-semibold text-gray-800">Subtotal:</span>
          <span className="font-bold text-gray-900 text-base">
            ${cartTotal.toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-5">Taxes and fees not included</p>

        {/* Buttons */}
        <button
          onClick={handleViewCart}
          className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-3 rounded-lg text-sm transition-colors mb-3"
        >
          View Cart
        </button>
        <button
          onClick={handleContinue}
          className="w-full border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-3 rounded-lg text-sm transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    </>
  );
}

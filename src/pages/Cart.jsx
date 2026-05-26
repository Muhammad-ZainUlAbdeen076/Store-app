import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";

const HANDLING_RATE = 0.03; // 3% handling fee example

export default function Cart() {
  const { cartItems, cartTotal, removeFromCart, updateCartQty } = useStore();
  const navigate = useNavigate();

  const handling = cartTotal > 0 ? parseFloat((cartTotal * HANDLING_RATE).toFixed(2)) : 0;
  const estimatedTotal = cartTotal + handling;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 md:px-10 lg:px-16 py-10 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>

        {cartItems.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13L5.4 5M10 21a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Your cart is empty</h3>
            <p className="text-sm text-gray-400 mb-6">Add some products to get started.</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2.5 bg-black text-white text-sm rounded-full hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── LEFT: Cart Items ── */}
            <div className="flex-1 w-full">
              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.cartId}
                    item={item}
                    onRemove={() => removeFromCart(item.cartId)}
                    onQtyChange={(qty) => updateCartQty(item.cartId, qty)}
                  />
                ))}
              </div>
            </div>

            {/* ── RIGHT: Order Summary ── */}
            <div className="w-full lg:w-96 flex-shrink-0">
              <div className="border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5">
                  Order Summary{" "}
                  <span className="text-gray-500 font-normal text-sm">
                    ({cartItems.length} item{cartItems.length !== 1 ? "s" : ""})
                  </span>
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Handling</span>
                    <span className="font-medium">${handling.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Shipping</span>
                    <span className="text-gray-400">--</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Sales Tax</span>
                    <span className="text-gray-400">--</span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-base">
                    <span>Estimated Total</span>
                    <span>${estimatedTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button onClick={() => navigate("/checkout")} className="mt-6 w-full bg-gray-900 hover:bg-black text-white font-semibold py-3 rounded-lg text-sm transition-colors">
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate("/")}
                  className="mt-3 w-full border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-3 rounded-lg text-sm transition-colors"
                >
                  Continue Shopping
                </button>

                {/* Dealer note */}
                <div className="mt-6 border-t border-gray-200 pt-5 space-y-3 text-xs text-gray-600 leading-relaxed">
                  <p className="font-semibold text-gray-800 text-sm">Note from the Dealer:</p>
                  <p>
                    Thank you for your order! All footwear/eyewear products will arrive 1–2 weeks
                    after purchase date; all apparel will be shipped 4–6 weeks after store closure.
                  </p>
                  <p>
                    There are no returns or exchanges on custom decorated apparel. Non-custom orders
                    are subject to freight charges for returns and exchanges.
                  </p>
                  <p>
                    Please review the Terms and Conditions prior to placing your order.
                  </p>
                  <p>
                    Please reach out to{" "}
                    <a href="mailto:customercare@tcateamstore.com" className="underline hover:text-black">
                      customercare@tcateamstore.com
                    </a>{" "}
                    if you have any questions about your order!
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

/* ── Single cart item row ── */
function CartItem({ item, onRemove, onQtyChange }) {
  const capitalize = (str) =>
    str ? str.split(" ").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ") : "";

  return (
    <div className="flex gap-4 py-5">
      {/* Image */}
      <div className="w-24 h-24 flex-shrink-0 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 p-1">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 uppercase text-sm tracking-wide leading-tight">
          {item.name}
        </p>
        {item.brand && (
          <p className="text-sm text-gray-500 mt-0.5">{capitalize(item.brand)}</p>
        )}
        <div className="mt-1.5 space-y-0.5 text-sm text-gray-600">
          {item.size && <p>Size: {item.size}</p>}
          {item.color && (
            <p className="flex items-center gap-1.5">
              Color:
              <span
                className="inline-block w-3.5 h-3.5 rounded-full border border-gray-300"
                style={{ backgroundColor: item.color.toLowerCase() }}
              />
              {capitalize(item.color)}
            </p>
          )}
          {item.design && <p>Design: {item.design}</p>}
        </div>
      </div>

      {/* Price + qty + delete */}
      <div className="flex flex-col items-end justify-between flex-shrink-0">
        <p className="font-bold text-gray-900">${(item.price * item.qty).toFixed(2)}</p>

        {/* Qty stepper */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onQtyChange(item.qty - 1)}
            disabled={item.qty <= 1}
            className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
          <button
            onClick={() => onQtyChange(item.qty + 1)}
            className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Delete */}
        <button
          onClick={onRemove}
          className="mt-2 text-red-400 hover:text-red-600 transition-colors"
          title="Remove item"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

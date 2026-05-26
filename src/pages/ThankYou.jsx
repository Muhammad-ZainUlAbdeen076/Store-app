import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";

export default function ThankYou() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  // If someone lands here directly without order data, redirect home
  if (!state?.orderNumber) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-xl font-bold text-gray-700 mb-3">No order found</h2>
          <button onClick={() => navigate("/")} className="mt-2 px-6 py-2.5 bg-black text-white text-sm rounded-full hover:bg-gray-800 transition-colors">
            Continue Shopping
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const { orderNumber, customerName, email, estimatedTotal, cartItems = [] } = state;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-start px-4 py-14 max-w-2xl mx-auto w-full">

        {/* ── Checkmark hero ── */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You, {customerName.split(" ")[0]}!</h1>
          <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
            Your order has been placed successfully. A confirmation email has been sent to {email}.
          </p>
        </div>

        {/* ── Order card ── */}
        <div className="w-full border border-gray-200 rounded-xl overflow-hidden">

          {/* Header */}
          <div className="bg-gray-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-0.5">Order Number</p>
              <p className="font-bold text-lg tracking-wide">{orderNumber}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-0.5">Estimated Total</p>
              <p className="font-bold text-lg">${estimatedTotal.toFixed(2)}</p>
            </div>
          </div>

          {/* Customer info */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Customer</p>
              <p className="font-semibold text-gray-800">{customerName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Email</p>
              <p className="font-semibold text-gray-800 break-all">{email}</p>
            </div>
          </div>

          {/* Items */}
          {cartItems.length > 0 && (
            <div className="px-6 py-4">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Items Ordered</p>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.cartId} className="flex items-start gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-contain border border-gray-200 rounded-lg bg-gray-50 p-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 uppercase leading-tight">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`, `Qty: ${item.qty}`]
                          .filter(Boolean).join("  ·  ")}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 flex-shrink-0">${(item.price * item.qty).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Dealer note ── */}
        <div className="mt-6 w-full border border-amber-200 bg-amber-50 rounded-xl px-5 py-4 text-sm text-amber-800 leading-relaxed space-y-2">
          <p className="font-semibold text-amber-900">Note from the Dealer:</p>
          <p>All footwear/eyewear products arrive 1–2 weeks after purchase. Apparel ships 4–6 weeks after store closure.</p>
          <p>No returns or exchanges on custom decorated apparel. Non-custom orders subject to freight charges for returns.</p>
          <p>Questions? <a href="mailto:customercare@tcateamstore.com" className="underline font-medium">customercare@tcateamstore.com</a></p>
        </div>

        {/* ── CTA Buttons ── */}
        <button
          onClick={() => window.print()}
          className="mt-8 w-full max-w-xs px-8 py-3 border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          Print / Save as PDF
        </button>

        <button
          onClick={() => navigate("/")}
          className="mt-3 w-full max-w-xs px-8 py-3 bg-gray-900 hover:bg-black text-white font-semibold rounded-lg text-sm transition-colors"
        >
          Continue Shopping
        </button>

      </main>

      <Footer />
    </div>
  );
}
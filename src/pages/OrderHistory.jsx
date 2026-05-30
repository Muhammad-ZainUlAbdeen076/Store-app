import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import { useNavigate } from "react-router-dom";

const STATUS_STYLES = {
  pending:   "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped:   "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrderHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 md:px-10 lg:px-16 py-10 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {loading ? (
          <div className="flex justify-center py-24">
            <svg className="animate-spin w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No orders yet</h3>
            <p className="text-sm text-gray-400 mb-6">Place your first order to see it here.</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2.5 bg-black text-white text-sm rounded-full hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden">

                {/* ── Order header ── */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Order</p>
                      <p className="font-bold text-gray-900">{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Date</p>
                      <p className="text-sm font-medium text-gray-700">
                        {order.createdAt?.toDate().toLocaleDateString("en-US", {
                          year: "numeric", month: "short", day: "numeric"
                        }) ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Total</p>
                      <p className="text-sm font-bold text-gray-900">${order.estimatedTotal?.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {order.status}
                    </span>
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      className={`transition-transform duration-200 ${expanded === order.id ? "rotate-180" : ""}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* ── Order details (expandable) ── */}
                {expanded === order.id && (
                  <div className="px-5 py-4 border-t border-gray-200">

                    {/* Items */}
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Items</p>
                    <div className="space-y-3 mb-5">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-14 h-14 object-contain border border-gray-200 rounded-lg bg-gray-50 p-1 flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 uppercase">{item.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`, `Qty: ${item.qty}`]
                                .filter(Boolean).join("  ·  ")}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-gray-900 flex-shrink-0">
                            ${(item.price * item.qty).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Summary */}
                    <div className="border-t border-gray-100 pt-4 space-y-1.5 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>${order.subtotal?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Handling</span>
                        <span>${order.handling?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-100">
                        <span>Total</span>
                        <span>${order.estimatedTotal?.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Shipping */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Shipping To</p>
                      <p className="text-sm text-gray-700">{order.shippingAddress}</p>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Notes</p>
                        <p className="text-sm text-gray-700">{order.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const STATUS_STYLES = {
  pending:   "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped:   "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function Orders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const snap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filterStatus === "all"
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  if (loading) return (
    <div className="flex justify-center py-24">
      <svg className="animate-spin w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500">{filtered.length} order{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors
              ${filterStatus === s ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <p className="text-gray-400 text-sm">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">

              {/* Order header */}
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Order</p>
                    <p className="font-bold text-gray-900">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Customer</p>
                    <p className="text-sm font-medium text-gray-700">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Date</p>
                    <p className="text-sm text-gray-600">
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
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {order.status}
                  </span>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    className={`transition-transform duration-200 flex-shrink-0 ${expanded === order.id ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>

              {/* Expanded details */}
              {expanded === order.id && (
                <div className="border-t border-gray-200 px-5 py-4 space-y-4">

                  {/* Customer info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400 uppercase mb-0.5">Email</p>
                      <p className="text-gray-800">{order.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase mb-0.5">Phone</p>
                      <p className="text-gray-800">{order.phone}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-gray-400 uppercase mb-0.5">Shipping Address</p>
                      <p className="text-gray-800">{order.shippingAddress}</p>
                    </div>
                    {order.notes && (
                      <div className="sm:col-span-2">
                        <p className="text-xs text-gray-400 uppercase mb-0.5">Notes</p>
                        <p className="text-gray-800">{order.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Items</p>
                    <div className="space-y-2">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-lg p-2">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-12 h-12 object-contain border border-gray-200 rounded-lg bg-white p-0.5 flex-shrink-0"/>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 uppercase">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`, `Qty: ${item.qty}`]
                                .filter(Boolean).join(" · ")}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-gray-900">${(item.price * item.qty).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span><span>${order.subtotal?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Handling</span><span>${order.handling?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-100">
                      <span>Total</span><span>${order.estimatedTotal?.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Status update */}
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Update Status</p>
                    <div className="flex flex-wrap gap-2">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(order.id, s)}
                          disabled={order.status === s || updating === order.id}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors disabled:opacity-50
                            ${order.status === s
                              ? STATUS_STYLES[s]
                              : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                        >
                          {updating === order.id && order.status !== s ? "..." : s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
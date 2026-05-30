import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase/config";

const STATUS_STYLES = {
  pending:   "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped:   "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, revenue: 0, users: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        // Orders
        const ordersSnap = await getDocs(collection(db, "orders"));
        const orders = ordersSnap.docs.map((d) => d.data());
        const pending = orders.filter((o) => o.status === "pending").length;
        const revenue = orders.reduce((sum, o) => sum + (o.estimatedTotal ?? 0), 0);

        // Users
        const usersSnap = await getDocs(collection(db, "users"));

        setStats({
          total:   orders.length,
          pending,
          revenue,
          users:   usersSnap.size,
        });

        // Recent 5 orders
        const recentSnap = await getDocs(
          query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5))
        );
        setRecentOrders(recentSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="flex justify-center py-24">
      <svg className="animate-spin w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Orders",   value: stats.total,              color: "text-gray-900" },
          { label: "Pending Orders", value: stats.pending,            color: "text-yellow-600" },
          { label: "Total Revenue",  value: `$${stats.revenue.toFixed(2)}`, color: "text-green-600" },
          { label: "Total Users",    value: stats.users,              color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-5 py-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-900">Recent Orders</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No orders yet</p>
          ) : recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
              <div>
                <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                <p className="text-xs text-gray-400">{order.customerName} · {order.createdAt?.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-bold text-gray-900">${order.estimatedTotal?.toFixed(2)}</p>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
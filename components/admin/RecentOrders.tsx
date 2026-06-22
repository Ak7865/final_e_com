import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface Order {
  _id: string;
  orderNumber: string;
  user?: {
    name: string;
    email: string;
  };
  total: number;
  paymentStatus: "pending" | "paid" | "refunded" | "failed";
  status: string;
  createdAt: string;
}

export function RecentOrders({ orders }: { orders: Order[] }) {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-stone-800 dark:text-stone-100">Recent Orders</h3>
        <Link href="/admin/orders" className="text-xs font-semibold text-sage-600 hover:underline">
          View All
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-cream-100 dark:bg-stone-800 text-stone-500 font-medium">
            <tr>
              <th className="p-3">Order Number</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Date</th>
              <th className="p-3">Total</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4 text-stone-400">
                  No recent orders.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="border-t border-stone-100 dark:border-stone-800">
                  <td className="p-3 font-medium text-stone-800 dark:text-stone-200">
                    {order.orderNumber}
                  </td>
                  <td className="p-3">
                    <p className="font-medium text-stone-700 dark:text-stone-300">
                      {order.user?.name || "Guest"}
                    </p>
                    <p className="text-xs text-stone-400">{order.user?.email}</p>
                  </td>
                  <td className="p-3 text-stone-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 font-semibold text-stone-800 dark:text-stone-100">
                    {formatPrice(order.total)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        order.paymentStatus === "paid"
                          ? "bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400"
                          : order.paymentStatus === "pending"
                          ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                          : "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-xs capitalize text-stone-600 dark:text-stone-400 font-medium">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

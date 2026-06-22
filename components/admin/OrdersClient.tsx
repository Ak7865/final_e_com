"use client";
import { useState } from "react";
import { Eye, Search } from "lucide-react";
import { OrderDetailModal } from "./OrderDetailModal";
import { formatPrice } from "@/lib/utils";
import { FormattedDate } from "@/components/ui/FormattedDate";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600", confirmed: "bg-blue-50 text-blue-600",
  processing: "bg-indigo-50 text-indigo-600", packed: "bg-purple-50 text-purple-600",
  shipped: "bg-cyan-50 text-cyan-600", out_for_delivery: "bg-teal-50 text-teal-600",
  delivered: "bg-green-50 text-green-600", cancelled: "bg-red-50 text-red-600", refunded: "bg-stone-100 text-stone-600",
};

export function OrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<any>(null);

  const filtered = orders.filter((o) => {
    const ms = (o.orderNumber?.toLowerCase() || "").includes(search.toLowerCase()) || o.user?.name?.toLowerCase().includes(search.toLowerCase());
    return ms && (!filter || o.status === filter);
  });

  const onUpdate = (updated: any) => {
    setOrders((p) => p.map((o) => (o._id === updated._id ? { ...o, ...updated } : o)));
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl">Orders</h1>
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center bg-white dark:bg-stone-900 rounded-full px-4 h-11 flex-1 min-w-[240px] shadow-sm">
          <Search className="h-4 w-4 text-stone-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order # or customer..." className="bg-transparent px-3 outline-none text-sm w-full" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-white dark:bg-stone-900 rounded-full px-4 h-11 text-sm shadow-sm outline-none">
          <option value="">All Statuses</option>
          {Object.keys(STATUS_COLORS).map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-100 dark:bg-stone-800 text-stone-500">
            <tr><th className="text-left p-4">Order</th><th className="text-left p-4">Customer</th><th className="text-left p-4">Date</th><th className="text-left p-4">Total</th><th className="text-left p-4">Payment</th><th className="text-left p-4">Status</th><th className="text-right p-4">Action</th></tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o._id} className="border-t border-stone-100 dark:border-stone-800">
                <td className="p-4 font-medium">{o.orderNumber}</td>
                <td className="p-4 text-stone-500">{o.user?.name}</td>
                <td className="p-4 text-stone-500"><FormattedDate date={o.createdAt} /></td>
                <td className="p-4">{formatPrice(o.total)}</td>
                <td className="p-4">
                  <span className="uppercase text-xs">
                    {typeof o.paymentMethod === "object" && o.paymentMethod
                      ? `${o.paymentMethod.cardBrand || "Card"} ****${o.paymentMethod.last4 || ""}`
                      : String(o.paymentMethod || "")}
                  </span>
                </td>
                <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full capitalize ${STATUS_COLORS[o.status]}`}>{o.status.replace(/_/g, " ")}</span></td>
                <td className="p-4 text-right"><button onClick={() => setSelected(o)} className="p-2 hover:bg-sage-50 rounded-lg"><Eye className="h-4 w-4 text-sage-600" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <OrderDetailModal order={selected} onClose={() => setSelected(null)} onUpdate={onUpdate} />}
    </div>
  );
}
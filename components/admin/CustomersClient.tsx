"use client";
import { useState } from "react";
import {
  Search, Mail, ShoppingBag, Phone, MapPin, Calendar,
  X, ExternalLink, TrendingUp, Users, DollarSign,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { FormattedDate } from "@/components/ui/FormattedDate";
import Link from "next/link";

function StatPill({
  icon: Icon,
  label,
  value,
  color = "sage",
}: {
  icon: any;
  label: string;
  value: string | number;
  color?: string;
}) {
  const colors: Record<string, string> = {
    sage: "bg-sage-50 dark:bg-sage-950/30 text-sage-600 dark:text-sage-400",
    gold: "bg-gold-50 dark:bg-amber-950/20 text-gold-500 dark:text-amber-400",
    blue: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400",
  };
  return (
    <div className={`rounded-xl p-4 text-center ${colors[color]}`}>
      <Icon className="h-5 w-5 mx-auto mb-1 opacity-70" />
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs opacity-70 mt-0.5">{label}</p>
    </div>
  );
}

export function CustomersClient({ customers }: { customers: any[] }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [sortBy, setSortBy] = useState<"newest" | "orders" | "spent">("newest");

  const filtered = customers
    .filter(
      (c) =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search)
    )
    .sort((a, b) => {
      if (sortBy === "orders") return b.orderCount - a.orderCount;
      if (sortBy === "spent") return b.totalSpent - a.totalSpent;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const totalRevenue = customers.reduce((a, c) => a + c.totalSpent, 0);
  const totalOrders = customers.reduce((a, c) => a + c.orderCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl text-stone-900 dark:text-stone-100">Customers</h1>
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <Users className="h-4 w-4" />
          <span>{customers.length} total customers</span>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 shadow-sm border border-stone-100 dark:border-stone-800 text-center">
          <p className="text-3xl font-bold font-serif text-stone-800 dark:text-stone-200">
            {customers.length}
          </p>
          <p className="text-xs text-stone-500 mt-1 flex items-center gap-1 justify-center">
            <Users className="h-3 w-3" /> Total Customers
          </p>
        </div>
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 shadow-sm border border-stone-100 dark:border-stone-800 text-center">
          <p className="text-3xl font-bold font-serif text-stone-800 dark:text-stone-200">
            {totalOrders}
          </p>
          <p className="text-xs text-stone-500 mt-1 flex items-center gap-1 justify-center">
            <ShoppingBag className="h-3 w-3" /> Total Orders
          </p>
        </div>
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 shadow-sm border border-stone-100 dark:border-stone-800 text-center">
          <p className="text-2xl font-bold font-serif text-sage-600 dark:text-sage-400">
            {formatPrice(totalRevenue)}
          </p>
          <p className="text-xs text-stone-500 mt-1 flex items-center gap-1 justify-center">
            <DollarSign className="h-3 w-3" /> Total Revenue
          </p>
        </div>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center bg-white dark:bg-stone-900 rounded-full px-4 h-11 flex-1 min-w-[200px] shadow-sm border border-stone-100 dark:border-stone-800">
          <Search className="h-4 w-4 text-stone-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="bg-transparent px-3 outline-none text-sm w-full"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-white dark:bg-stone-900 rounded-full px-4 h-11 text-sm shadow-sm outline-none border border-stone-100 dark:border-stone-800"
        >
          <option value="newest">Newest First</option>
          <option value="orders">Most Orders</option>
          <option value="spent">Highest Spend</option>
        </select>
      </div>

      {/* Customer Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-12 text-center shadow-sm border border-stone-100 dark:border-stone-800">
          <Users className="h-10 w-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500">No customers found matching your search.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div
              key={c._id}
              onClick={() => setSelected(c)}
              className="bg-white dark:bg-stone-900 rounded-2xl p-5 shadow-sm border border-stone-100 dark:border-stone-800 cursor-pointer hover:shadow-md hover:border-sage-200 dark:hover:border-sage-800 transition group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-sage-100 dark:bg-sage-950/40 grid place-items-center text-sage-600 font-bold text-lg overflow-hidden flex-shrink-0">
                  {c.image ? (
                    <img src={c.image} className="h-full w-full object-cover" alt={c.name} />
                  ) : (
                    c.name?.[0]?.toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                    {c.name}
                  </p>
                  <p className="text-xs text-stone-500 truncate flex items-center gap-1">
                    <Mail className="h-3 w-3 shrink-0" />
                    {c.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-cream-50 dark:bg-stone-800 rounded-xl p-3">
                  <p className="font-bold text-stone-800 dark:text-stone-200">{c.orderCount}</p>
                  <p className="text-[10px] text-stone-500">Orders</p>
                </div>
                <div className="bg-cream-50 dark:bg-stone-800 rounded-xl p-3">
                  <p className="font-bold text-sage-600 dark:text-sage-400 text-sm">
                    {formatPrice(c.totalSpent)}
                  </p>
                  <p className="text-[10px] text-stone-500">Spent</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] text-stone-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <FormattedDate date={c.createdAt} />
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    c.isActive
                      ? "bg-green-50 text-green-600 dark:bg-green-950/20"
                      : "bg-stone-100 text-stone-400"
                  }`}
                >
                  {c.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-lg shadow-2xl border border-stone-100 dark:border-stone-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-br from-sage-50 to-cream-100 dark:from-stone-800 dark:to-stone-900 p-6">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/80 dark:bg-stone-800/80 grid place-items-center hover:bg-white dark:hover:bg-stone-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-sage-100 dark:bg-sage-950/40 grid place-items-center text-sage-600 text-2xl font-bold overflow-hidden flex-shrink-0">
                  {selected.image ? (
                    <img src={selected.image} className="h-full w-full object-cover" alt={selected.name} />
                  ) : (
                    selected.name?.[0]?.toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="font-serif text-2xl text-stone-800 dark:text-stone-200">
                    {selected.name}
                  </h2>
                  <p className="text-sm text-stone-500">{selected.email}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium inline-block mt-1 ${
                      selected.provider === "google"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    via {selected.provider || "credentials"}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 p-6 pb-0">
              <StatPill icon={ShoppingBag} label="Orders" value={selected.orderCount} color="sage" />
              <StatPill icon={DollarSign} label="Total Spent" value={formatPrice(selected.totalSpent)} color="gold" />
              <StatPill icon={MapPin} label="Addresses" value={selected.addresses?.length || 0} color="blue" />
            </div>

            {/* Details */}
            <div className="p-6 space-y-3">
              {selected.phone && (
                <div className="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
                  <Phone className="h-4 w-4 text-stone-400 shrink-0" />
                  {selected.phone}
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
                <Calendar className="h-4 w-4 text-stone-400 shrink-0" />
                Joined <FormattedDate date={selected.createdAt} />
              </div>
              {selected.addresses?.length > 0 && (
                <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                    Saved Addresses
                  </p>
                  <div className="space-y-2">
                    {selected.addresses.slice(0, 2).map((addr: any, i: number) => (
                      <div
                        key={i}
                        className="text-xs text-stone-500 bg-cream-50 dark:bg-stone-800 rounded-xl p-3"
                      >
                        {addr.line1}, {addr.city}, {addr.state} {addr.postalCode}
                        {addr.isDefault && (
                          <span className="ml-2 bg-sage-100 text-sage-700 text-[10px] px-1.5 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link
                href={`/admin/orders?customer=${selected._id}`}
                className="flex items-center justify-center gap-2 w-full h-11 mt-2 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-medium hover:bg-sage-50 dark:hover:bg-sage-950/20 transition"
                onClick={() => setSelected(null)}
              >
                <ExternalLink className="h-4 w-4" />
                View All Orders
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";
import { useState } from "react";
import Link from "next/link";
import { Bell, Package, Tag, Truck, Heart, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";
import { FormattedDate } from "@/components/ui/FormattedDate";

const ICONS: Record<string, any> = {
  order_placed: Package, order_shipped: Truck, order_delivered: CheckCheck,
  order_confirmed: Package, discount: Tag, wishlist: Heart, low_stock: Package,
};

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const { items, unread } = useNotifications();

  const markRead = async () => { await fetch("/api/notifications", { method: "PATCH" }); };

  return (
    <div className="relative">
      <button onClick={() => { setOpen(!open); if (!open) markRead(); }} className="relative p-2 hover:bg-sage-50 rounded-full">
        <Bell className="h-5 w-5" />
        {unread > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] h-4 min-w-4 px-1 rounded-full grid place-items-center">{unread}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className="absolute right-0 mt-2 w-80 bg-white dark:bg-stone-900 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-stone-100">
                <span className="font-medium">Notifications</span>
                <Link href="/notifications" className="text-xs text-sage-600" onClick={() => setOpen(false)}>View all</Link>
              </div>
              <div className="max-h-96 overflow-auto">
                {items.length === 0 && <p className="p-6 text-center text-sm text-stone-400">No notifications</p>}
                {items.map((n) => {
                  const Icon = ICONS[n.type] || Bell;
                  return (
                    <Link key={n._id} href={n.link || "#"} onClick={() => setOpen(false)} className={`flex gap-3 p-4 hover:bg-sage-50 border-b border-stone-50 ${!n.read ? "bg-sage-50/40" : ""}`}>
                      <div className="h-9 w-9 rounded-full bg-sage-100 grid place-items-center text-sage-600 shrink-0"><Icon className="h-4 w-4" /></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-stone-500">{n.message}</p>
                        <p className="text-[10px] text-stone-400 mt-1"><FormattedDate date={n.createdAt} /></p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
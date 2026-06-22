"use client";
import { useEffect, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Bell, Package, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { FormattedDate } from "@/components/ui/FormattedDate";

const ICONS: Record<string, any> = {
  order_placed: Package,
  low_stock: AlertTriangle,
};

export default function AdminNotificationsPage() {
  const { items } = useNotifications();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    setNotifications(items);
    // Mark as read when entering the page
    fetch("/api/notifications", { method: "PATCH" });
  }, [items]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="font-serif text-3xl">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-12 text-center shadow-sm border border-stone-100 dark:border-stone-800">
          <h3 className="font-serif text-2xl text-stone-800 dark:text-stone-200 mb-2">
            No Admin Notifications
          </h3>
          <p className="text-stone-500 text-sm">
            All caught up! We will list updates here when new orders are placed or stock levels run low.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden divide-y divide-stone-100 dark:divide-stone-800">
          {notifications.map((n) => {
            const Icon = ICONS[n.type] || Bell;
            return (
              <Link
                key={n._id}
                href={n.link || "#"}
                className={`flex gap-4 p-5 hover:bg-stone-50 dark:hover:bg-stone-800/40 transition items-start ${!n.read ? "bg-sage-50/20" : ""}`}
              >
                <div className="h-10 w-10 rounded-xl bg-sage-50 dark:bg-sage-950/40 grid place-items-center text-sage-600 dark:text-sage-400 shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-medium text-stone-800 dark:text-stone-200 text-sm sm:text-base">
                      {n.title}
                    </h3>
                    <span className="text-xs text-stone-400 font-medium">
                      <FormattedDate date={n.createdAt} />
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1">
                    {n.message}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

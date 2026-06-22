"use client";
import { useEffect, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Navbar } from "@/components/shop/Navbar";
import { Footer } from "@/components/shop/Footer";
import { Bell, Package, Tag, Truck, Heart, CheckCheck } from "lucide-react";
import Link from "next/link";
import { FormattedDate } from "@/components/ui/FormattedDate";

const ICONS: Record<string, any> = {
  order_placed: Package,
  order_shipped: Truck,
  order_delivered: CheckCheck,
  order_confirmed: Package,
  discount: Tag,
  wishlist: Heart,
  low_stock: Package,
};

export default function CustomerNotificationsPage() {
  const { items } = useNotifications();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    setNotifications(items);
    // Mark as read when entering the page
    fetch("/api/notifications", { method: "PATCH" });
  }, [items]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream-50 dark:bg-stone-950 pb-20">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="font-serif text-3xl md:text-4xl text-stone-900 dark:text-stone-100 mb-8 tracking-wide">
            Notifications
          </h1>

          {notifications.length === 0 ? (
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-12 text-center shadow-sm border border-stone-100 dark:border-stone-800">
              <h3 className="font-serif text-2xl text-stone-800 dark:text-stone-200 mb-2">
                All Caught Up!
              </h3>
              <p className="text-stone-500 text-sm max-w-md mx-auto">
                You don't have any notifications right now. We'll update you when there's news about your orders or account activity.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((n) => {
                const Icon = ICONS[n.type] || Bell;
                return (
                  <Link
                    key={n._id}
                    href={n.link || "#"}
                    className="block bg-white dark:bg-stone-900 rounded-2xl p-5 shadow-sm border border-stone-100 dark:border-stone-800 hover:shadow-md transition"
                  >
                    <div className="flex gap-4 items-start">
                      <div className="h-10 w-10 rounded-full bg-sage-100 dark:bg-sage-950/40 grid place-items-center text-sage-600 dark:text-sage-400 shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <h3 className="font-medium text-stone-800 dark:text-stone-200 text-sm sm:text-base">
                            {n.title}
                          </h3>
                          <span className="text-[10px] text-stone-400">
                            <FormattedDate date={n.createdAt} />
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-stone-500 mt-1">
                          {n.message}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

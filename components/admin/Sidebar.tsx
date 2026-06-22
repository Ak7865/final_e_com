"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tags,
  BarChart3, Settings, Bell, Menu, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/notifications", label: "Notifications", icon: Bell, badge: true },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const [open, setOpen] = useState(true);
  const path = usePathname();
  const { unread } = useNotifications();

  return (
    <motion.aside
      animate={{ width: open ? 256 : 72 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen bg-white dark:bg-stone-900 border-r border-stone-100 dark:border-stone-800 z-40 hidden lg:flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-stone-100 dark:border-stone-800 shrink-0">
        {open && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-serif text-xl text-sage-600 tracking-wide"
          >
            Lumière
          </motion.span>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-xl hover:bg-sage-50 dark:hover:bg-stone-800 transition ml-auto"
          aria-label="Toggle sidebar"
        >
          <motion.div animate={{ rotate: open ? 0 : 180 }}>
            <ChevronRight className="h-5 w-5 text-stone-500" />
          </motion.div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto scrollbar-hide">
        {links.map((l) => {
          const active = path.startsWith(l.href);
          const showBadge = l.badge && unread > 0;

          return (
            <Link
              key={l.href}
              href={l.href}
              title={!open ? l.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group",
                active
                  ? "bg-sage-600 text-white shadow-sm shadow-sage-600/20"
                  : "text-stone-600 dark:text-stone-400 hover:bg-sage-50 dark:hover:bg-stone-800 hover:text-sage-700 dark:hover:text-sage-300"
              )}
            >
              <div className="relative shrink-0">
                <l.icon className="h-5 w-5" />
                {showBadge && !active && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[9px] grid place-items-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </div>
              {open && (
                <span className="text-sm font-medium truncate">{l.label}</span>
              )}
              {open && showBadge && (
                <span className="ml-auto h-5 min-w-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] grid place-items-center">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
              {/* Tooltip when collapsed */}
              {!open && (
                <div className="absolute left-full ml-2 px-3 py-1.5 bg-stone-800 dark:bg-stone-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {l.label}
                  {showBadge && (
                    <span className="ml-1.5 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                      {unread}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-stone-100 dark:border-stone-800 shrink-0">
        {open ? (
          <p className="text-[10px] text-stone-400 text-center">Lumière Admin v1.0</p>
        ) : (
          <div className="h-1 w-8 bg-stone-200 dark:bg-stone-700 rounded-full mx-auto" />
        )}
      </div>
    </motion.aside>
  );
}
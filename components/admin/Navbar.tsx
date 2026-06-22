"use client";
import Image from "next/image";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { Moon, Sun, LogOut, Search } from "lucide-react";
import { NotificationDropdown } from "@/components/shop/NotificationDropdown";

export function AdminNavbar({ user }: { user: any }) {
  const { theme, setTheme } = useTheme();
  return (
    <header className="h-16 bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center bg-cream-100 dark:bg-stone-800 rounded-full px-4 h-10 w-72">
        <Search className="h-4 w-4 text-stone-400" />
        <input placeholder="Search..." className="bg-transparent px-3 outline-none text-sm w-full" />
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 hover:bg-sage-50 dark:hover:bg-stone-800 rounded-full">
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <NotificationDropdown />
        <div className="flex items-center gap-2 pl-2">
          {user.image ? <Image src={user.image} alt="" width={32} height={32} className="rounded-full h-8 w-8 object-cover" /> : <div className="h-8 w-8 rounded-full bg-sage-100 grid place-items-center text-sage-600 text-sm">{user.name?.[0]}</div>}
          <span className="text-sm font-medium hidden sm:block">{user.name}</span>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="p-2 hover:bg-red-50 rounded-full"><LogOut className="h-5 w-5 text-red-500" /></button>
      </div>
    </header>
  );
}
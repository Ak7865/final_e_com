"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { ShoppingBag, Heart, User, Menu, X, LogOut, Package, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchBar } from "./SearchBar";
import { NotificationDropdown } from "./NotificationDropdown";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

const NAV_LINKS = [
  { href: "/products", label: "Shop All" },
  { href: "/products?category=serums", label: "Serums" },
  { href: "/products?category=moisturizers", label: "Moisturizers" },
  { href: "/products?category=cleansers", label: "Cleansers" },
];

export function Navbar() {
  const { data: session } = useSession();
  const cartCount = useCartStore((s) => s.count());
  const wishCount = useWishlistStore((s) => s.items.length);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-cream-50/90 dark:bg-stone-950/90 backdrop-blur border-b border-stone-100 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-6 w-6" /></button>
          <Link href="/" className="font-serif text-2xl text-sage-600 tracking-wide">Lumière</Link>

          <nav className="hidden lg:flex items-center gap-8 text-sm">
            {NAV_LINKS.map((l) => <Link key={l.href} href={l.href} className="text-stone-600 hover:text-sage-600 transition">{l.label}</Link>)}
          </nav>

          <div className="hidden md:block flex-1 max-w-xs"><SearchBar /></div>

          <div className="flex items-center gap-1">
            {session && <NotificationDropdown />}
            <Link href="/wishlist" className="relative p-2 hover:bg-sage-50 rounded-full">
              <Heart className="h-5 w-5" />
              {mounted && wishCount > 0 && <Badge>{wishCount}</Badge>}
            </Link>
            <Link href="/cart" className="relative p-2 hover:bg-sage-50 rounded-full">
              <ShoppingBag className="h-5 w-5" />
              {mounted && cartCount > 0 && <Badge>{cartCount}</Badge>}
            </Link>
            {session ? (
              <div className="relative">
                <button onClick={() => setUserMenu(!userMenu)} className="p-1">
                  {session.user?.image
                    ? <Image src={session.user.image} alt="" width={32} height={32} className="rounded-full h-8 w-8 object-cover" />
                    : <div className="h-8 w-8 rounded-full bg-sage-100 grid place-items-center text-sage-600 text-sm">{session.user?.name?.[0]}</div>}
                </button>
                <AnimatePresence>
                  {userMenu && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-2 w-52 bg-white dark:bg-stone-900 rounded-2xl shadow-xl p-2 z-50">
                      <p className="px-3 py-2 text-sm font-medium border-b border-stone-100">{session.user?.name}</p>
                      <MenuLink href="/profile" icon={User} label="My Profile" onClick={() => setUserMenu(false)} />
                      <MenuLink href="/orders" icon={Package} label="My Orders" onClick={() => setUserMenu(false)} />
                      {session.user?.role === "admin" && <MenuLink href="/admin/dashboard" icon={LayoutDashboard} label="Admin Panel" onClick={() => setUserMenu(false)} />}
                      <button onClick={async () => { 
                        useCartStore.getState().clearCart(); 
                        useWishlistStore.getState().clear(); 
                        await signOut({ redirect: false }); 
                        window.location.href = "/"; 
                      }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg">
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login" className="p-2 hover:bg-sage-50 rounded-full"><User className="h-5 w-5" /></Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/40 z-50 lg:hidden" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-stone-900 z-50 p-6 lg:hidden">
              <div className="flex justify-between mb-6">
                <span className="font-serif text-2xl text-sage-600">Lumière</span>
                <button onClick={() => setMobileOpen(false)}><X className="h-6 w-6" /></button>
              </div>
              <SearchBar />
              <nav className="mt-6 space-y-1">
                {NAV_LINKS.map((l) => <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block py-3 border-b border-stone-100 text-stone-700">{l.label}</Link>)}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <MobileBottomNav mounted={mounted} />
    </>
  );
}

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="absolute -top-0.5 -right-0.5 bg-sage-600 text-white text-[10px] h-4 min-w-4 px-1 rounded-full grid place-items-center">{children}</span>
);
const MenuLink = ({ href, icon: Icon, label, onClick }: any) => (
  <Link href={href} onClick={onClick} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-sage-50 rounded-lg"><Icon className="h-4 w-4" /> {label}</Link>
);

// Mobile bottom navigation
function MobileBottomNav({ mounted }: { mounted: boolean }) {
  const cartCount = useCartStore((s) => s.count());
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 md:hidden">
      <div className="grid grid-cols-4 h-16">
        <BottomLink href="/" icon={LayoutDashboard} label="Home" />
        <BottomLink href="/products" icon={Package} label="Shop" />
        <BottomLink href="/wishlist" icon={Heart} label="Wishlist" />
        <BottomLink href="/cart" icon={ShoppingBag} label="Cart" badge={mounted ? cartCount : 0} />
      </div>
    </nav>
  );
}
const BottomLink = ({ href, icon: Icon, label, badge }: any) => (
  <Link href={href} className="flex flex-col items-center justify-center gap-1 text-stone-500 relative">
    <Icon className="h-5 w-5" />
    <span className="text-[10px]">{label}</span>
    {badge > 0 && <span className="absolute top-2 right-6 bg-sage-600 text-white text-[9px] h-4 min-w-4 px-1 rounded-full grid place-items-center">{badge}</span>}
  </Link>
);
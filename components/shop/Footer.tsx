import Link from "next/link";
import { Instagram, Facebook, Twitter, Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-sage-700 text-cream-100 mt-20 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-1">
          <span className="font-serif text-3xl">Lumière</span>
          <p className="text-cream-100/70 text-sm mt-4 flex items-center gap-2"><Leaf className="h-4 w-4" /> Clean botanical beauty.</p>
          <div className="flex gap-3 mt-6">
            {[Instagram, Facebook, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="h-9 w-9 grid place-items-center rounded-full bg-cream-100/10 hover:bg-cream-100/20"><Icon className="h-4 w-4" /></a>
            ))}
          </div>
        </div>
        <FooterCol title="Shop" links={[["All Products", "/products"], ["Serums", "/products?category=serums"], ["Moisturizers", "/products?category=moisturizers"], ["Best Sellers", "/products?sort=-soldCount"]]} />
        <FooterCol title="Account" links={[["My Profile", "/profile"], ["Orders", "/orders"], ["Wishlist", "/wishlist"], ["Login", "/login"]]} />
        <FooterCol title="Support" links={[["Contact Us", "#"], ["Shipping", "#"], ["Returns", "#"], ["FAQ", "#"]]} />
      </div>
      <div className="border-t border-cream-100/10">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-cream-100/60 text-sm">© {new Date().getFullYear()} Lumière. All rights reserved.</div>
      </div>
    </footer>
  );
}

const FooterCol = ({ title, links }: { title: string; links: [string, string][] }) => (
  <div>
    <h4 className="font-medium mb-4">{title}</h4>
    <ul className="space-y-2 text-sm text-cream-100/70">
      {links.map(([label, href]) => <li key={label}><Link href={href} className="hover:text-cream-100">{label}</Link></li>)}
    </ul>
  </div>
);
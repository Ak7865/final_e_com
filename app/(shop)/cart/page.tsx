"use client";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shop/Navbar";
import { Footer } from "@/components/shop/Footer";
import { useCartStore } from "@/store/cartStore";
import { calculateTotals } from "@/lib/checkout";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal } = useCartStore();
  const sub = subtotal();
  const { tax, shippingFee, total } = calculateTotals(sub);

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="font-serif text-3xl mb-8">Shopping Cart</h1>
        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-12 w-12 mx-auto text-stone-300 mb-4" />
            <p className="text-stone-500 mb-4">Your cart is empty.</p>
            <Button asChild><Link href="/products">Shop Now</Link></Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((i) => (
                <div key={i.productId + i.variant} className="flex gap-4 bg-white dark:bg-stone-900 rounded-2xl p-4 shadow-sm">
                  <Image src={i.image} alt={i.name} width={96} height={96} className="rounded-xl object-cover h-24 w-24" />
                  <div className="flex-1">
                    <Link href={`/products/${i.slug}`} className="font-medium hover:text-sage-600">{i.name}</Link>
                    {i.variant && <p className="text-sm text-stone-400">{i.variant}</p>}
                    <p className="text-sage-600 font-medium mt-1">{formatPrice(i.price)}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-stone-200 rounded-full">
                        <button onClick={() => updateQty(i.productId, i.quantity - 1, i.variant)} className="p-2"><Minus className="h-3.5 w-3.5" /></button>
                        <span className="w-8 text-center text-sm">{i.quantity}</span>
                        <button onClick={() => updateQty(i.productId, i.quantity + 1, i.variant)} className="p-2"><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      <button onClick={() => removeItem(i.productId, i.variant)} className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <span className="font-medium">{formatPrice(i.price * i.quantity)}</span>
                </div>
              ))}
            </div>
            <aside className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-sm h-fit">
              <h2 className="font-medium text-lg mb-4">Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-stone-500">Subtotal</span><span>{formatPrice(sub)}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Tax</span><span>{formatPrice(tax)}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Shipping</span><span>{shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}</span></div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t mt-2"><span>Total</span><span>{formatPrice(total)}</span></div>
              </div>
              <Button size="lg" className="w-full mt-6" asChild><Link href="/checkout">Proceed to Checkout</Link></Button>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
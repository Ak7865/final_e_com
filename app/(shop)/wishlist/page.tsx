"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shop/Navbar";
import { Footer } from "@/components/shop/Footer";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const { items, removeItem, clear } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addItem);
  const [movedIds, setMovedIds] = useState<Set<string>>(new Set());

  const handleMoveToCart = (item: any) => {
    addToCart({
      productId: item.productId,
      slug: item.slug,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: 1,
      stock: 999,
    });
    removeItem(item.productId);
    setMovedIds((prev) => new Set(prev).add(item.productId));
    toast.success(`${item.name} moved to cart!`);
  };

  const handleMoveAllToCart = () => {
    items.forEach((item) => {
      addToCart({
        productId: item.productId,
        slug: item.slug,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: 1,
        stock: 999,
      });
    });
    clear();
    toast.success(`${items.length} items moved to cart!`);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream-50 dark:bg-stone-950 pb-24">
        {/* Header */}
        <div className="bg-cream-100 dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 py-12 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-rose-50 dark:bg-rose-950/30 text-rose-500 px-4 py-1.5 rounded-full text-xs font-medium mb-4">
              <Heart className="h-3.5 w-3.5 fill-rose-500" />
              Your Wishlist
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-stone-900 dark:text-stone-100 mb-3 tracking-wide">
              Saved Favorites
            </h1>
            <p className="text-stone-500 dark:text-stone-400 text-sm max-w-md mx-auto">
              Products you've loved. Ready when you are.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="inline-flex h-24 w-24 rounded-full bg-rose-50 dark:bg-rose-950/30 items-center justify-center mb-6 mx-auto">
                <Heart className="h-10 w-10 text-rose-300" />
              </div>
              <h2 className="font-serif text-2xl text-stone-700 dark:text-stone-300 mb-3">
                Your wishlist is empty
              </h2>
              <p className="text-stone-500 text-sm mb-8 max-w-sm mx-auto">
                Discover our botanical skincare collection and save your
                favorites to revisit later.
              </p>
              <Button asChild size="lg">
                <Link href="/products" className="gap-2">
                  Explore Collection <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Actions Bar */}
              <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <p className="text-stone-500 text-sm">
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {items.length}
                  </span>{" "}
                  {items.length === 1 ? "item" : "items"} saved
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      clear();
                      toast.success("Wishlist cleared");
                    }}
                    className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    Clear All
                  </Button>
                  <Button size="sm" onClick={handleMoveAllToCart} className="gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Move All to Cart
                  </Button>
                </div>
              </div>

              {/* Wishlist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                  {items.map((item, index) => (
                    <motion.div
                      key={item.productId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-square bg-cream-100 dark:bg-stone-800 overflow-hidden">
                        <Link href={`/products/${item.slug}`}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </Link>
                        {/* Remove from wishlist */}
                        <button
                          onClick={() => {
                            removeItem(item.productId);
                            toast.success("Removed from wishlist");
                          }}
                          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 dark:bg-stone-900/90 shadow-sm grid place-items-center hover:bg-red-50 transition"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <Link href={`/products/${item.slug}`}>
                          <h3 className="font-medium text-sm text-stone-800 dark:text-stone-200 line-clamp-2 hover:text-sage-600 transition">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-sage-600 font-semibold mt-1">
                          {formatPrice(item.price)}
                        </p>

                        <Button
                          size="sm"
                          className="w-full mt-3 gap-2"
                          onClick={() => handleMoveToCart(item)}
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          Add to Cart
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Continue Shopping */}
              <div className="text-center mt-12">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 text-sm text-sage-600 hover:text-sage-700 font-medium"
                >
                  Continue Shopping <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

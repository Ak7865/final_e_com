"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatPrice } from "@/lib/utils";

export function ProductCard({ product }: { product: any }) {
  const router = useRouter();
  const { data: session } = useSession();
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, has } = useWishlistStore();
  const wished = has(product._id);
  const img = product.images?.[0]?.url || "/placeholder.png";

  const checkAuth = () => {
    if (!session) {
      toast.error("Please log in to continue.");
      router.push(`/login?callbackUrl=${window.location.pathname + window.location.search}`);
      return false;
    }
    return true;
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!checkAuth()) return;
    toggle({ productId: product._id, name: product.name, slug: product.slug, image: img, price: product.price });
    toast.success(wished ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!checkAuth()) return;
    addItem({ productId: product._id, name: product.name, slug: product.slug, image: img, price: product.price, quantity: 1, stock: product.stock });
    toast.success("Added to cart 🛍️");
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="group relative bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-cream-100">
        <Link href={`/products/${product.slug}`}>
          <Image src={img} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        </Link>
        {product.discount > 0 && (
          <span className="absolute top-3 left-3 bg-gold-500 text-white text-xs px-2 py-1 rounded-full">-{product.discount}%</span>
        )}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 h-9 w-9 grid place-items-center bg-white/90 rounded-full backdrop-blur cursor-pointer"
        >
          <Heart className={`h-4 w-4 ${wished ? "fill-red-500 text-red-500" : "text-stone-600"}`} />
        </button>
      </div>

      <div className="p-4">
        <p className="text-xs uppercase tracking-wider text-sage-500">{product.category?.name}</p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-serif text-lg text-stone-800 dark:text-stone-100 mt-1 line-clamp-1">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 mt-1">
          <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
          <span className="text-xs text-stone-500">{product.rating?.toFixed(1)} ({product.numReviews})</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="font-medium">{formatPrice(product.price)}</span>
            {product.compareAtPrice > product.price && (
              <span className="text-xs text-stone-400 line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>
          <Button size="icon" variant="default" className="cursor-pointer"
            onClick={handleAddToCart}>
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
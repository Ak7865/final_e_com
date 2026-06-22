"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart, ShoppingBag, Star, Shield, Truck, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatPrice } from "@/lib/utils";

interface Variant {
  _id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  brand: string;
  price: number;
  compareAtPrice?: number;
  discount: number;
  images: { url: string; publicId?: string }[];
  variants?: Variant[];
  stock: number;
  ingredients?: string[];
  skinType?: string[];
  benefits?: string[];
  howToUse?: string;
  rating: number;
  numReviews: number;
}

export function ProductInfo({ product }: { product: Product }) {
  const router = useRouter();
  const { data: session } = useSession();
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, has } = useWishlistStore();
  const wished = has(product._id);

  // Variant state
  const hasVariants = product.variants && product.variants.length > 0;
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    hasVariants ? product.variants![0] : null
  );

  // Quantity state
  const [quantity, setQuantity] = useState(1);

  // Accordion active tab state
  const [activeTab, setActiveTab] = useState<string | null>("description");

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isOutOfStock = currentStock <= 0;
  const imgUrl = product.images?.[0]?.url || "/placeholder.png";

  const checkAuth = () => {
    if (!session) {
      toast.error("Please log in to continue.");
      router.push(`/login?callbackUrl=${window.location.pathname + window.location.search}`);
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!checkAuth()) return;
    if (isOutOfStock) {
      toast.error("This item is currently out of stock.");
      return;
    }

    const itemToAdd = {
      productId: product._id,
      name: product.name + (selectedVariant ? ` - ${selectedVariant.name}` : ""),
      slug: product.slug,
      image: imgUrl,
      price: currentPrice,
      quantity: quantity,
      stock: currentStock,
      variantId: selectedVariant?._id,
    };

    addItem(itemToAdd);
    toast.success(`Added ${quantity} ${quantity === 1 ? "item" : "items"} to cart 🛍️`);
  };

  const handleBuyNow = () => {
    if (!checkAuth()) return;
    if (isOutOfStock) {
      toast.error("This item is currently out of stock.");
      return;
    }

    const itemToAdd = {
      productId: product._id,
      name: product.name + (selectedVariant ? ` - ${selectedVariant.name}` : ""),
      slug: product.slug,
      image: imgUrl,
      price: currentPrice,
      quantity: quantity,
      stock: currentStock,
      variantId: selectedVariant?._id,
    };

    addItem(itemToAdd);
    router.push("/checkout");
  };

  const handleWishlist = () => {
    if (!checkAuth()) return;
    toggle({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      image: imgUrl,
      price: product.price,
    });
    toast.success(wished ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-sage-600 mb-1">
          {product.brand}
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-stone-900 dark:text-stone-100 tracking-wide">
          {product.name}
        </h1>
        
        {/* Rating */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(product.rating)
                    ? "fill-gold-400 text-gold-400"
                    : "text-stone-200 dark:text-stone-700"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-stone-500 font-medium">
            {product.rating.toFixed(1)} ({product.numReviews} {product.numReviews === 1 ? "review" : "reviews"})
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-4 py-2 border-y border-stone-100 dark:border-stone-800">
        <span className="text-2xl font-semibold text-stone-900 dark:text-stone-50">
          {formatPrice(currentPrice)}
        </span>
        {product.compareAtPrice && product.compareAtPrice > currentPrice && (
          <span className="text-lg text-stone-400 line-through">
            {formatPrice(product.compareAtPrice)}
          </span>
        )}
        {product.discount > 0 && (
          <span className="bg-gold-500 text-white text-xs px-2.5 py-0.5 rounded-full font-medium">
            Save {product.discount}%
          </span>
        )}
      </div>

      {/* Short Description */}
      {product.shortDescription && (
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          {product.shortDescription}
        </p>
      )}

      {/* Skin Type tags */}
      {product.skinType && product.skinType.length > 0 && (
        <div>
          <h4 className="text-xs uppercase font-semibold text-stone-400 tracking-wider mb-2">
            Recommended For
          </h4>
          <div className="flex flex-wrap gap-2">
            {product.skinType.map((type) => (
              <span
                key={type}
                className="text-xs px-3 py-1 bg-sage-50 dark:bg-stone-800 text-sage-700 dark:text-sage-300 rounded-full font-medium"
              >
                {type} Skin
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Variants Selector */}
      {hasVariants && (
        <div>
          <h4 className="text-xs uppercase font-semibold text-stone-400 tracking-wider mb-2">
            Select Size
          </h4>
          <div className="flex gap-3">
            {product.variants!.map((v) => (
              <button
                key={v._id}
                onClick={() => setSelectedVariant(v)}
                className={`px-4 py-2 text-sm rounded-lg border font-medium transition ${
                  selectedVariant?._id === v._id
                    ? "border-sage-600 bg-sage-50/50 dark:bg-sage-950/20 text-sage-700 dark:text-sage-300"
                    : "border-stone-200 dark:border-stone-800 hover:border-stone-400"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity & Actions */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden h-12">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={isOutOfStock || quantity <= 1}
              className="px-4 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 disabled:opacity-30 h-full cursor-pointer"
            >
              -
            </button>
            <span className="w-10 text-center font-medium select-none">{quantity}</span>
            <button
              onClick={() => setQuantity(q => Math.min(currentStock, q + 1))}
              disabled={isOutOfStock || quantity >= currentStock}
              className="px-4 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 disabled:opacity-30 h-full cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Add to Cart */}
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex-1 h-12 gap-2 text-base font-medium rounded-lg cursor-pointer"
          >
            <ShoppingBag className="h-5 w-5" />
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>

          {/* Wishlist */}
          <Button
            onClick={handleWishlist}
            variant="outline"
            className="h-12 w-12 p-0 border-stone-200 dark:border-stone-800 hover:bg-stone-50 rounded-lg cursor-pointer"
          >
            <Heart className={`h-5 w-5 ${wished ? "fill-red-500 text-red-500" : "text-stone-600"}`} />
          </Button>
        </div>

        {/* Buy Now Button */}
        <Button
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className="w-full h-12 text-base font-semibold rounded-lg bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 cursor-pointer"
        >
          Buy Now
        </Button>

        {/* Stock Level Message */}
        {!isOutOfStock && currentStock <= 5 && (
          <p className="text-sm font-medium text-amber-600 dark:text-amber-500">
            Only {currentStock} left in stock - order soon!
          </p>
        )}
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-4 py-4 border-t border-stone-100 dark:border-stone-800 mt-2 text-center text-xs text-stone-500">
        <div className="flex flex-col items-center gap-1">
          <Truck className="h-4 w-4 text-sage-600" />
          <span>Free Shipping</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Shield className="h-4 w-4 text-sage-600" />
          <span>Secure Checkout</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <RefreshCw className="h-4 w-4 text-sage-600" />
          <span>30-Day Returns</span>
        </div>
      </div>

      {/* Accordion Info */}
      <div className="border-t border-stone-100 dark:border-stone-800 mt-2">
        <AccordionItem
          id="description"
          title="Details"
          active={activeTab === "description"}
          onClick={() => setActiveTab(activeTab === "description" ? null : "description")}
        >
          <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            {product.description}
          </p>
        </AccordionItem>

        {product.howToUse && (
          <AccordionItem
            id="how-to-use"
            title="How To Use"
            active={activeTab === "how-to-use"}
            onClick={() => setActiveTab(activeTab === "how-to-use" ? null : "how-to-use")}
          >
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              {product.howToUse}
            </p>
          </AccordionItem>
        )}

        {product.benefits && product.benefits.length > 0 && (
          <AccordionItem
            id="benefits"
            title="Key Benefits"
            active={activeTab === "benefits"}
            onClick={() => setActiveTab(activeTab === "benefits" ? null : "benefits")}
          >
            <ul className="list-disc list-inside text-sm text-stone-600 dark:text-stone-400 space-y-1.5">
              {product.benefits.map((benefit, i) => (
                <li key={i}>{benefit}</li>
              ))}
            </ul>
          </AccordionItem>
        )}

        {product.ingredients && product.ingredients.length > 0 && (
          <AccordionItem
            id="ingredients"
            title="Ingredients"
            active={activeTab === "ingredients"}
            onClick={() => setActiveTab(activeTab === "ingredients" ? null : "ingredients")}
          >
            <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
              {product.ingredients.join(", ")}
            </p>
          </AccordionItem>
        )}
      </div>
    </div>
  );
}

function AccordionItem({
  id,
  title,
  active,
  onClick,
  children,
}: {
  id: string;
  title: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-stone-100 dark:border-stone-800">
      <button
        onClick={onClick}
        className="flex items-center justify-between w-full py-4 text-sm font-semibold text-stone-800 dark:text-stone-200 text-left cursor-pointer"
      >
        <span>{title}</span>
        <span className="text-stone-400 text-lg leading-none">{active ? "−" : "+"}</span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          active ? "max-h-[500px] pb-4" : "max-h-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

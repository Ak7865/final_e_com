import Image from "next/image";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  images: { url: string; publicId?: string }[];
}

export function LowStockAlerts({ products }: { products: Product[] }) {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-stone-800 dark:text-stone-100 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Low Stock Alerts
        </h3>
        <Link href="/admin/products" className="text-xs font-semibold text-sage-600 hover:underline">
          Manage Inventory
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[300px] space-y-4 pr-1">
        {products.length === 0 ? (
          <div className="h-full flex items-center justify-center text-stone-400 text-sm py-12">
            All inventory levels are healthy.
          </div>
        ) : (
          products.map((product) => {
            const img = product.images?.[0]?.url || "/placeholder.png";
            return (
              <div key={product._id} className="flex items-center justify-between gap-3 pb-3 border-b border-stone-50 dark:border-stone-800 last:border-b-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-cream-50 flex-shrink-0">
                    <Image src={img} alt={product.name} fill className="object-cover" sizes="40px" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-stone-800 dark:text-stone-200 line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="text-xs text-stone-400">SKU: {product.sku || "N/A"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400">
                    {product.stock} left
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

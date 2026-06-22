import Link from "next/link";
import Image from "next/image";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: {
    url?: string;
    publicId?: string;
  };
}

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {categories.map((category) => {
        const imageUrl = category.image?.url || "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop";
        return (
          <Link
            key={category._id}
            href={`/products?category=${category.slug}`}
            className="group relative h-96 overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-900 block"
          >
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={category.name}
                fill
                sizes="(max-w-768px) 100vw, (max-w-1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white flex flex-col justify-end translate-y-4 transition-transform duration-300 group-hover:translate-y-0">
              <h3 className="font-serif text-2xl mb-1 tracking-wide">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-stone-200/90 line-clamp-2 mb-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {category.description}
                </p>
              )}
              <span className="text-xs font-medium tracking-wider uppercase border-b border-white/40 pb-1 self-start">
                Discover More
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

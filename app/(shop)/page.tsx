import { Suspense } from "react";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { Hero } from "@/components/shop/Hero";
import { ProductCard } from "@/components/shop/ProductCard";
import { Navbar } from "@/components/shop/Navbar";
import { Footer } from "@/components/shop/Footer";
import { CategoryGrid } from "@/components/shop/CategoryGrid";

export const dynamic = "force-dynamic";

async function getData() {
  await dbConnect();
  const [featured, bestSellers, trending, categories] = await Promise.all([
    Product.find({ isFeatured: true, isActive: true }).populate("category", "name").limit(8).lean(),
    Product.find({ isBestSeller: true, isActive: true }).populate("category", "name").limit(4).lean(),
    Product.find({ isTrending: true, isActive: true }).populate("category", "name").limit(4).lean(),
    Category.find({ isActive: true }).limit(6).lean(),
  ]);
  return JSON.parse(JSON.stringify({ featured, bestSellers, trending, categories }));
}

export default async function HomePage() {
  const { featured, bestSellers, categories } = await getData();
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="font-serif text-3xl text-center mb-2">Shop by Category</h2>
          <p className="text-center text-stone-500 mb-10">Curated rituals for every skin concern</p>
          <CategoryGrid categories={categories} />
        </section>
        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="font-serif text-3xl text-center mb-10">Featured Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map((p: any) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
        <section className="bg-cream-100 dark:bg-stone-900 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="font-serif text-3xl text-center mb-10">Best Sellers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {bestSellers.map((p: any) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

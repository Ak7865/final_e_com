import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import Review from "@/models/Review";
import { Navbar } from "@/components/shop/Navbar";
import { Footer } from "@/components/shop/Footer";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductInfo } from "@/components/shop/ProductInfo";
import { ReviewSection } from "@/components/shop/ReviewSection";
import { ProductCard } from "@/components/shop/ProductCard";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();
  const p = await Product.findOne({ slug }).lean();
  if (!p) return { title: "Not Found" };
  return { title: (p as any).name, description: (p as any).shortDescription };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await dbConnect();
  const product = await Product.findOne({ slug, isActive: true }).populate("category", "name slug").lean();
  if (!product) notFound();

  const [reviews, related] = await Promise.all([
    Review.find({ product: (product as any)._id }).sort("-createdAt").lean(),
    Product.find({ category: (product as any).category._id, _id: { $ne: (product as any)._id }, isActive: true }).limit(4).populate("category", "name").lean(),
  ]);

  const data = JSON.parse(JSON.stringify({ product, reviews, related }));

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <ProductGallery images={data.product.images} />
          <ProductInfo product={data.product} />
        </div>
        <ReviewSection product={data.product} reviews={data.reviews} />
        <section className="mt-20">
          <h2 className="font-serif text-3xl mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {data.related.map((p: any) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

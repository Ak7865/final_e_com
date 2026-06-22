import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { Navbar } from "@/components/shop/Navbar";
import { Footer } from "@/components/shop/Footer";
import { ProductCard } from "@/components/shop/ProductCard";
import Link from "next/link";
import { escapeRegex } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop Botanical Skincare",
  description: "Browse our curated collection of luxury botanical skincare products, custom-formulated for all skin types.",
};

interface PageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    q?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  await dbConnect();
  const search = await searchParams;
  const categorySlug = search.category;
  const sortQuery = search.sort || "newest";
  const searchQuery = search.q || "";

  // Resolve category if specified
  let categoryId = null;
  let categoryName = "Shop All";
  let categoryDesc = "Curated botanical formulas designed for healthy, glowing skin.";

  if (categorySlug) {
    const cat = await Category.findOne({ slug: categorySlug }).lean();
    if (cat) {
      categoryId = (cat as any)._id;
      categoryName = (cat as any).name;
      categoryDesc = (cat as any).description || categoryDesc;
    }
  }

  // Build filters
  const filter: any = { isActive: true };
  if (categoryId) {
    filter.category = categoryId;
  }
  if (searchQuery) {
    const escapedQuery = escapeRegex(searchQuery);
    const matchedCats = await Category.find({
      $or: [
        { name: { $regex: escapedQuery, $options: "i" } },
        { description: { $regex: escapedQuery, $options: "i" } }
      ]
    }).select("_id").lean();
    const matchedCategoryIds = matchedCats.map((c: any) => c._id);

    filter.$or = [
      { name: { $regex: escapedQuery, $options: "i" } },
      { description: { $regex: escapedQuery, $options: "i" } },
      { brand: { $regex: escapedQuery, $options: "i" } },
      { sku: { $regex: escapedQuery, $options: "i" } },
      { tags: { $regex: escapedQuery, $options: "i" } },
      { skinType: { $regex: escapedQuery, $options: "i" } },
      { benefits: { $regex: escapedQuery, $options: "i" } },
      { ingredients: { $regex: escapedQuery, $options: "i" } }
    ];

    if (matchedCategoryIds.length > 0) {
      filter.$or.push({ category: { $in: matchedCategoryIds } });
    }
  }

  // Sorting
  let sortObj: any = { createdAt: -1 };
  if (sortQuery === "price-asc") sortObj = { price: 1 };
  else if (sortQuery === "price-desc") sortObj = { price: -1 };
  else if (sortQuery === "rating") sortObj = { rating: -1 };

  // Fetch data
  const [productsData, categoriesData] = await Promise.all([
    Product.find(filter).populate("category", "name slug").sort(sortObj).lean(),
    Category.find({ isActive: true }).lean(),
  ]);

  const products = JSON.parse(JSON.stringify(productsData));
  const categories = JSON.parse(JSON.stringify(categoriesData));

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream-50 dark:bg-stone-950 pb-20">
        {/* Category Header */}
        <div className="bg-cream-100 dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 py-16 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-serif text-4xl md:text-5xl text-stone-900 dark:text-stone-100 mb-4 tracking-wide">
              {categoryName}
            </h1>
            <p className="text-stone-500 dark:text-stone-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              {categoryDesc}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 shrink-0 flex flex-col gap-8">
            {/* Categories */}
            <div>
              <h3 className="text-xs uppercase font-bold tracking-wider text-stone-400 mb-4">
                Categories
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    href="/products"
                    className={`transition hover:text-sage-600 block ${
                      !categorySlug
                        ? "text-sage-600 font-semibold"
                        : "text-stone-600 dark:text-stone-400"
                    }`}
                  >
                    All Products
                  </Link>
                </li>
                {categories.map((cat: any) => (
                  <li key={cat._id}>
                    <Link
                      href={`/products?category=${cat.slug}${search.sort ? `&sort=${search.sort}` : ""}${
                        search.q ? `&q=${search.q}` : ""
                      }`}
                      className={`transition hover:text-sage-600 block ${
                        categorySlug === cat.slug
                          ? "text-sage-600 font-semibold"
                          : "text-stone-600 dark:text-stone-400"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sorting */}
            <div>
              <h3 className="text-xs uppercase font-bold tracking-wider text-stone-400 mb-4">
                Sort By
              </h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  { value: "newest", label: "Newest Arrivals" },
                  { value: "price-asc", label: "Price: Low to High" },
                  { value: "price-desc", label: "Price: High to Low" },
                  { value: "rating", label: "Customer Rating" },
                ].map((option) => (
                  <li key={option.value}>
                    <Link
                      href={`/products?${categorySlug ? `category=${categorySlug}&` : ""}sort=${
                        option.value
                      }${search.q ? `&q=${search.q}` : ""}`}
                      className={`transition hover:text-sage-600 block ${
                        sortQuery === option.value
                          ? "text-sage-600 font-semibold"
                          : "text-stone-600 dark:text-stone-400"
                      }`}
                    >
                      {option.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 rounded-2xl p-12 text-center shadow-sm border border-stone-100 dark:border-stone-800">
                <h3 className="font-serif text-2xl text-stone-800 dark:text-stone-200 mb-2">
                  No Products Found
                </h3>
                <p className="text-stone-500 text-sm max-w-md mx-auto mb-6">
                  We couldn't find any products matching your selection. Try clearing your filters or searching for something else.
                </p>
                <Link
                  href="/products"
                  className="inline-flex h-11 items-center justify-center px-6 bg-sage-600 hover:bg-sage-700 text-white rounded-lg text-sm font-medium transition"
                >
                  Clear All Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: any) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

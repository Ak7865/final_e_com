import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { ProductsClient } from "@/components/admin/ProductsClient";

export const dynamic = "force-dynamic";

export const metadata = { title: "Products | Admin" };

export default async function AdminProductsPage() {
  await dbConnect();
  const [products, categories] = await Promise.all([
    Product.find().populate("category", "name").sort("-createdAt").limit(50).lean(),
    Category.find().lean(),
  ]);
  return <ProductsClient initialProducts={JSON.parse(JSON.stringify(products))} categories={JSON.parse(JSON.stringify(categories))} />;
}

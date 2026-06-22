import { dbConnect } from "@/lib/db";
import Category from "@/models/Category";
import Coupon from "@/models/Coupon";
import { CategoriesClient } from "@/components/admin/CategoriesClient";

export const dynamic = "force-dynamic";

export const metadata = { title: "Categories | Admin" };

export default async function CategoriesPage() {
  await dbConnect();
  const [categories, coupons] = await Promise.all([
    Category.find().sort("-createdAt").lean(),
    Coupon.find().sort("-createdAt").lean(),
  ]);
  return <CategoriesClient initCategories={JSON.parse(JSON.stringify(categories))} initCoupons={JSON.parse(JSON.stringify(coupons))} />;
}

import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { AnalyticsClient } from "@/components/admin/AnalyticsClient";

export const dynamic = "force-dynamic";

export const metadata = { title: "Analytics | Admin" };

export default async function AnalyticsPage() {
  await dbConnect();
  const [monthly, topProducts, statusDist, categoryRevenue] = await Promise.all([
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: { $month: "$createdAt" }, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Product.find().sort("-soldCount").limit(5).select("name soldCount rating price").lean(),
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Order.aggregate([
      { $unwind: "$items" },
      { $lookup: { from: "products", localField: "items.product", foreignField: "_id", as: "p" } },
      { $unwind: "$p" },
      { $lookup: { from: "categories", localField: "p.category", foreignField: "_id", as: "cat" } },
      { $unwind: "$cat" },
      { $group: { _id: "$cat.name", revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
      { $sort: { revenue: -1 } },
    ]),
  ]);
  return <AnalyticsClient data={JSON.parse(JSON.stringify({ monthly, topProducts, statusDist, categoryRevenue }))} />;
}

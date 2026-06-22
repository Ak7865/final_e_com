import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import { CustomersClient } from "@/components/admin/CustomersClient";

export const dynamic = "force-dynamic";

export const metadata = { title: "Customers | Admin" };

export default async function AdminCustomersPage() {
  await dbConnect();
  const customers = await User.find({ role: "customer" }).sort("-createdAt").lean();
  // Aggregate order stats per customer
  const stats = await Order.aggregate([
    { $group: { _id: "$user", orders: { $sum: 1 }, spent: { $sum: "$total" } } },
  ]);
  const statMap = Object.fromEntries(stats.map((s) => [s._id?.toString(), s]));
  const enriched = customers.map((c: any) => ({
    ...c, orderCount: statMap[c._id.toString()]?.orders || 0, totalSpent: statMap[c._id.toString()]?.spent || 0,
  }));
  return <CustomersClient customers={JSON.parse(JSON.stringify(enriched))} />;
}

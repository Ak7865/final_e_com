import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { StatCard } from "@/components/admin/StatCard";
import { SalesChart } from "@/components/admin/SalesChart";
import { RecentOrders } from "@/components/admin/RecentOrders";
import { LowStockAlerts } from "@/components/admin/LowStockAlerts";
import { DollarSign, ShoppingCart, Package, Users } from "lucide-react";

export const dynamic = "force-dynamic";

async function getStats() {
  await dbConnect();
  const [revenueAgg, orderCount, productCount, customerCount, recent, lowStock, monthlySales] = await Promise.all([
    Order.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments({ role: "customer" }),
    Order.find().sort("-createdAt").limit(5).populate("user", "name email").lean(),
    Product.find({ $expr: { $lte: ["$stock", "$lowStockThreshold"] } }).limit(8).lean(),
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$total" }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);
  return JSON.parse(JSON.stringify({
    revenue: revenueAgg[0]?.total || 0, orderCount, productCount, customerCount, recent, lowStock, monthlySales,
  }));
}

export default async function Dashboard() {
  const s = await getStats();
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`$${s.revenue.toLocaleString()}`} icon={DollarSign} trend="+12.5%" />
        <StatCard title="Orders" value={s.orderCount} icon={ShoppingCart} trend="+8.2%" />
        <StatCard title="Products" value={s.productCount} icon={Package} />
        <StatCard title="Customers" value={s.customerCount} icon={Users} trend="+5.1%" />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><SalesChart data={s.monthlySales} /></div>
        <LowStockAlerts products={s.lowStock} />
      </div>
      <RecentOrders orders={s.recent} />
    </div>
  );
}

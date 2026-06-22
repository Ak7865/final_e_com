import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";
import { OrdersClient } from "@/components/admin/OrdersClient";

export const dynamic = "force-dynamic";

export const metadata = { title: "Orders | Admin" };

export default async function AdminOrdersPage() {
  await dbConnect();
  const orders = await Order.find().populate("user", "name email").sort("-createdAt").limit(100).lean();
  return <OrdersClient initialOrders={JSON.parse(JSON.stringify(orders))} />;
}

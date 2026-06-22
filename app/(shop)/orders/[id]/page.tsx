import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";
import { Navbar } from "@/components/shop/Navbar";
import { OrderTimeline } from "@/components/shop/OrderTimeline";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isValidOrder = /^[0-9a-fA-F]{24}$/.test(id);
  if (!isValidOrder) notFound();

  await dbConnect();
  const order = await Order.findById(id).lean();
  if (!order || (order as any).user.toString() !== session.user.id) notFound();
  const o = JSON.parse(JSON.stringify(order));

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="font-serif text-3xl">Order {o.orderNumber}</h1>
            <p className="text-stone-500 text-sm">Placed {new Date(o.createdAt).toLocaleDateString()}</p>
          </div>
          <span className="text-xs px-3 py-1.5 rounded-full bg-sage-50 text-sage-600 capitalize">{o.status.replace(/_/g, " ")}</span>
        </div>

        <OrderTimeline currentStatus={o.status} history={o.statusHistory} trackingId={o.trackingId} deliveryEstimate={o.deliveryEstimate} />

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-sm">
            <h3 className="font-medium mb-3">Items</h3>
            {o.items.map((it: any) => (
              <div key={it.product} className="flex gap-3 py-2 text-sm">
                <div className="h-12 w-12 rounded-lg bg-cover bg-center bg-cream-100" style={{ backgroundImage: `url(${it.image})` }} />
                <div className="flex-1"><p>{it.name}</p><p className="text-stone-400">Qty {it.quantity}</p></div>
                <span>{formatPrice(it.price * it.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-sm">
            <h3 className="font-medium mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <Row label="Subtotal" value={formatPrice(o.subtotal)} />
              {o.discount > 0 && <Row label="Discount" value={`-${formatPrice(o.discount)}`} />}
              <Row label="Tax" value={formatPrice(o.tax)} />
              <Row label="Shipping" value={o.shippingFee === 0 ? "FREE" : formatPrice(o.shippingFee)} />
              <div className="flex justify-between font-semibold pt-2 border-t"><span>Total</span><span>{formatPrice(o.total)}</span></div>
            </div>
            <h3 className="font-medium mt-5 mb-2">Shipping To</h3>
            <p className="text-sm text-stone-500">{o.shippingAddress.fullName}<br />{o.shippingAddress.line1}, {o.shippingAddress.city}<br />{o.shippingAddress.state} {o.shippingAddress.postalCode}</p>
          </div>
        </div>
      </main>
    </>
  );
}
const Row = ({ label, value }: any) => <div className="flex justify-between"><span className="text-stone-500">{label}</span><span>{value}</span></div>;

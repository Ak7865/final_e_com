import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";
import { Navbar } from "@/components/shop/Navbar";
import { Footer } from "@/components/shop/Footer";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Orders",
  description: "View and track your previous orders, shipping estimates, and tracking numbers.",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/orders");
  }

  const isValidUser = /^[0-9a-fA-F]{24}$/.test(session.user.id);
  let orders = [];

  if (isValidUser) {
    await dbConnect();
    const ordersData = await Order.find({ user: session.user.id }).sort("-createdAt").lean();
    orders = JSON.parse(JSON.stringify(ordersData));
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream-50 dark:bg-stone-950 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="font-serif text-3xl md:text-4xl text-stone-900 dark:text-stone-100 mb-8 tracking-wide">
            My Orders
          </h1>

          {orders.length === 0 ? (
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-12 text-center shadow-sm border border-stone-100 dark:border-stone-800">
              <h3 className="font-serif text-2xl text-stone-800 dark:text-stone-200 mb-2">
                No Orders Yet
              </h3>
              <p className="text-stone-500 text-sm max-w-md mx-auto mb-6">
                You haven't placed any orders yet. Explore our botanical skincare collection to find your perfect ritual.
              </p>
              <Link
                href="/products"
                className="inline-flex h-11 items-center justify-center px-6 bg-sage-600 hover:bg-sage-700 text-white rounded-lg text-sm font-medium transition"
              >
                Shop Our Collection
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order: any) => (
                <div
                  key={order._id}
                  className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-800 hover:shadow-md transition animate-fade-up"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-stone-100 dark:border-stone-800 mb-4">
                    <div>
                      <p className="text-xs text-stone-400 uppercase tracking-wider mb-0.5">Order Number</p>
                      <h3 className="font-medium text-stone-800 dark:text-stone-200">{order.orderNumber}</h3>
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 uppercase tracking-wider mb-0.5">Date Placed</p>
                      <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 uppercase tracking-wider mb-0.5">Total</p>
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize ${
                          order.status === "delivered"
                            ? "bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400"
                            : order.status === "cancelled"
                            ? "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400"
                            : "bg-sage-50 text-sage-600 dark:bg-sage-950/20 dark:text-sage-400"
                        }`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  {/* Order Preview Items */}
                  <div className="flex items-center justify-between gap-6 flex-wrap md:flex-nowrap">
                    <div className="flex flex-wrap gap-3 items-center">
                      {order.items.slice(0, 3).map((item: any) => (
                        <div
                          key={item.product}
                          className="relative h-12 w-12 rounded-lg overflow-hidden bg-cream-50 border border-stone-100 dark:border-stone-800 flex-shrink-0"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="object-cover h-full w-full"
                          />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-xs text-stone-400 font-medium">
                          +{order.items.length - 3} more items
                        </span>
                      )}
                    </div>
                    
                    <Link
                      href={`/orders/${order._id}`}
                      className="h-10 inline-flex items-center justify-center px-5 border border-stone-200 dark:border-stone-800 hover:border-stone-400 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-300 transition w-full md:w-auto"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

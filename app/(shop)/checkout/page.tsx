import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { Navbar } from "@/components/shop/Navbar";
import { CheckoutClient } from "@/components/shop/CheckoutClient";

export const dynamic = "force-dynamic";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/checkout");

  const isValidUser = /^[0-9a-fA-F]{24}$/.test(session.user.id);
  if (!isValidUser) {
    redirect("/login?callbackUrl=/checkout");
  }

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  const addresses = JSON.parse(JSON.stringify((user as any)?.addresses || []));

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="font-serif text-3xl mb-8">Checkout</h1>
        <CheckoutClient savedAddresses={addresses} />
      </main>
    </>
  );
}

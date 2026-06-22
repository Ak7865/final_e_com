import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { Navbar } from "@/components/shop/Navbar";
import { ProfileClient } from "@/components/shop/ProfileClient";

export const dynamic = "force-dynamic";

export const metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/profile");
  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <ProfileClient user={JSON.parse(JSON.stringify(user))} />
      </main>
    </>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { AdminNavbar } from "@/components/admin/Navbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/login");

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-stone-950">
      <AdminSidebar />
      <div className="lg:ml-64 transition-all">
        <AdminNavbar user={session.user} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
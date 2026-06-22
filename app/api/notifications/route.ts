import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Notification from "@/models/Notification";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ notifications: [], unread: 0 });
  await dbConnect();
  const audience = session.user.role === "admin" ? "admin" : "customer";
  const query = audience === "admin" ? { audience: "admin" } : { user: session.user.id };
  const [notifications, unread] = await Promise.all([
    Notification.find(query).sort("-createdAt").limit(20).lean(),
    Notification.countDocuments({ ...query, read: false }),
  ]);
  return NextResponse.json({ notifications: JSON.parse(JSON.stringify(notifications)), unread });
}

export async function PATCH() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const query = session.user.role === "admin" ? { audience: "admin" } : { user: session.user.id };
  await Notification.updateMany(query, { read: true });
  return NextResponse.json({ success: true });
}
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "10"));
  const skip = (page - 1) * limit;

  // Admins can see all orders; customers see only their own
  const filter =
    session.user.role === "admin" ? {} : { user: session.user.id };

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  return NextResponse.json({
    orders: JSON.parse(JSON.stringify(orders)),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}

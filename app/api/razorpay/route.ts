import { NextResponse } from "next/server";
import { auth } from "@/auth";
import Razorpay from "razorpay";
import { sanitizeNoSQL } from "@/lib/utils";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId } = sanitizeNoSQL(await req.json());
    if (!orderId || !/^[0-9a-fA-F]{24}$/.test(orderId)) {
      return NextResponse.json({ error: "Valid orderId is required" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay credentials not configured" }, { status: 500 });
    }

    await dbConnect();
    const localOrder = await Order.findById(orderId).select("user total paymentMethod paymentStatus orderNumber").lean();
    if (!localOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if ((localOrder as any).user.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if ((localOrder as any).paymentMethod !== "online" || (localOrder as any).paymentStatus !== "pending") {
      return NextResponse.json({ error: "Order is not payable online" }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(Number((localOrder as any).total) * 100),
      currency: "USD",
      receipt: (localOrder as any).orderNumber || orderId,
      notes: { localOrderId: orderId },
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Razorpay order creation failed:", error);
    return NextResponse.json({ error: error.message || "Failed to create Razorpay order" }, { status: 500 });
  }
}

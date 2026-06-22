import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";
import Notification from "@/models/Notification";
import crypto from "crypto";
import { sanitizeNoSQL } from "@/lib/utils";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, localOrderId } = sanitizeNoSQL(await req.json());

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !localOrderId) {
      return NextResponse.json({ error: "Missing required verification fields" }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: "Razorpay secret key not configured" }, { status: 500 });
    }

    // Verify signature authenticity
    const shasum = crypto.createHmac("sha256", keySecret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest("hex");
    const expected = Buffer.from(digest, "hex");
    const received = Buffer.from(razorpay_signature, "hex");

    if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
      return NextResponse.json({ error: "Invalid payment signature verification failed" }, { status: 400 });
    }

    // Payment is valid! Update database
    await dbConnect();
    const order = await Order.findById(localOrderId);
    if (!order) {
      return NextResponse.json({ error: "Local order not found" }, { status: 404 });
    }
    if (order.user.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (order.paymentMethod !== "online" || order.paymentStatus !== "pending") {
      return NextResponse.json({ error: "Order is not pending online payment" }, { status: 400 });
    }

    order.paymentStatus = "paid";
    order.status = "confirmed";
    order.statusHistory.push({
      status: "confirmed",
      note: `Online payment verified. Razorpay Payment ID: ${razorpay_payment_id}`,
      date: new Date(),
    });

    await order.save();

    // Create confirmation notification
    await Notification.create({
      user: order.user,
      audience: "customer",
      type: "order_confirmed",
      title: "Payment Confirmed 💳",
      message: `Your payment for order ${order.orderNumber} has been verified and confirmed.`,
      link: `/orders/${order._id}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Razorpay verification failed:", error);
    return NextResponse.json({ error: error.message || "Verification process failed" }, { status: 500 });
  }
}

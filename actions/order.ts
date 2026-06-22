"use server";
import { revalidatePath } from "next/cache";
import { dbConnect } from "../lib/db";
import Order from "../models/Order";
import Product from "../models/Product";
import Notification from "../models/Notification";
import { auth } from "../auth";
import mongoose from "mongoose";

export async function placeOrder(payload: {
  items: any[]; shippingAddress: any; paymentMethod: "cod" | "online";
  subtotal: number; tax: number; shippingFee: number; discount: number; couponCode?: string; total: number;
}) {
  const session = await auth();
  if (!session?.user) return { error: "Login required" };
  await dbConnect();

  let dbSession: mongoose.mongo.ClientSession | null = null;
  try {
    dbSession = await mongoose.startSession();
    dbSession.startTransaction();
  } catch (e) {
    dbSession = null;
  }

  const options = dbSession ? { session: dbSession } : {};

  try {
    const [order] = await Order.create(
      [
        {
          ...payload,
          user: session.user.id,
          statusHistory: [{ status: "pending", note: "Order placed" }],
        },
      ],
      options
    );

    // Decrement stock + sold count with stock validation checks
    for (const item of payload.items) {
      const updated = await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity, soldCount: item.quantity } },
        { ...options, new: true }
      );

      if (!updated) {
        throw new Error(`Product not found: ${item.name}`);
      }
      if (updated.stock < 0) {
        throw new Error(`Insufficient stock for product ${item.name}`);
      }
    }

    // Notifications
    await Notification.create(
      [
        {
          user: session.user.id,
          audience: "customer",
          type: "order_placed",
          title: "Order Placed 🎉",
          message: `Your order ${order.orderNumber} is confirmed.`,
          link: `/orders/${order._id}`,
        },
        {
          audience: "admin",
          type: "order_placed",
          title: "New Order",
          message: `New order ${order.orderNumber} placed.`,
          link: `/admin/orders`,
        },
      ],
      options
    );

    if (dbSession) {
      await dbSession.commitTransaction();
    }

    revalidatePath("/orders");
    return { success: true, orderId: order._id.toString() };
  } catch (error: any) {
    if (dbSession) {
      await dbSession.abortTransaction();
    }
    console.error("Order placement transaction rolled back:", error);
    return { error: error.message || "Failed to place order due to a database conflict." };
  } finally {
    if (dbSession) {
      dbSession.endSession();
    }
  }
}

export async function updateOrderStatus(orderId: string, status: string, extra?: { trackingId?: string; deliveryEstimate?: Date }) {
  const session = await auth();
  if (session?.user?.role !== "admin") return { error: "Unauthorized" };
  await dbConnect();
  const order = await Order.findById(orderId);
  if (!order) return { error: "Not found" };

  order.status = status;
  if (extra?.trackingId) order.trackingId = extra.trackingId;
  if (extra?.deliveryEstimate) order.deliveryEstimate = extra.deliveryEstimate;
  order.statusHistory.push({ status, date: new Date() });
  if (status === "delivered") order.paymentStatus = "paid";
  await order.save();

  await Notification.create({
    user: order.user, audience: "customer", type: `order_${status}`,
    title: "Order Update", message: `Your order ${order.orderNumber} is now ${status.replace(/_/g, " ")}.`,
    link: `/orders/${order._id}`,
  });

  revalidatePath("/admin/orders");
  return { success: true };
}

// Append to actions/order.ts

export async function cancelOrder(orderId: string, reason: string) {
  const session = await auth();
  await dbConnect();
  const order = await Order.findById(orderId);
  if (!order) return { error: "Not found" };
  // Customer can cancel own pending order; admin can cancel any
  const isOwner = order.user.toString() === session?.user?.id;
  if (!isOwner && session?.user?.role !== "admin") return { error: "Unauthorized" };

  order.status = "cancelled";
  order.cancelReason = reason;
  order.statusHistory.push({ status: "cancelled", note: reason });
  await order.save();

  // Restock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, soldCount: -item.quantity } });
  }
  await Notification.create({ user: order.user, audience: "customer", type: "order_cancelled", title: "Order Cancelled", message: `Order ${order.orderNumber} was cancelled.`, link: `/orders/${order._id}` });
  revalidatePath("/admin/orders");
  return { success: true };
}

export async function refundOrder(orderId: string, amount: number) {
  const session = await auth();
  if (session?.user?.role !== "admin") return { error: "Unauthorized" };
  await dbConnect();
  const order = await Order.findById(orderId);
  if (!order) return { error: "Not found" };
  order.status = "refunded";
  order.paymentStatus = "refunded";
  order.refundAmount = amount;
  order.statusHistory.push({ status: "refunded", note: `Refunded $${amount}` });
  await order.save();
  await Notification.create({ user: order.user, audience: "customer", type: "refund", title: "Refund Processed", message: `$${amount} refunded for ${order.orderNumber}.`, link: `/orders/${order._id}` });
  revalidatePath("/admin/orders");
  return { success: true };
}
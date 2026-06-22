"use server";
import { dbConnect } from "../lib/db";
import Coupon from "../models/Coupon";

export async function validateCoupon(code: string, subtotal: number) {
  await dbConnect();
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) return { error: "Invalid coupon code" };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { error: "Coupon expired" };
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) return { error: "Coupon limit reached" };
  if (subtotal < coupon.minPurchase) return { error: `Minimum purchase $${coupon.minPurchase} required` };

  let discount = coupon.type === "percent" ? (subtotal * coupon.value) / 100 : coupon.value;
  if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;

  return { success: true, discount: Math.round(discount * 100) / 100, code: coupon.code };
}
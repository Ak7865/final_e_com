"use server";
import { revalidatePath } from "next/cache";
import { auth } from "../auth";
import { dbConnect } from "../lib/db";
import Review from "../models/Review";
import Product from "../models/Product";
import Order from "../models/Order";

async function recalcRating(productId: string) {
  const stats = await Review.aggregate([
    { $match: { product: (await import("mongoose")).default.Types.ObjectId.createFromHexString(productId) } },
    { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  await Product.findByIdAndUpdate(productId, {
    rating: stats[0]?.avg || 0,
    numReviews: stats[0]?.count || 0,
  });
}

export async function addReview(productId: string, data: { rating: number; title?: string; comment: string }) {
  const session = await auth();
  if (!session?.user) return { error: "Login required" };
  await dbConnect();

  const existing = await Review.findOne({ product: productId, user: session.user.id });
  if (existing) return { error: "You already reviewed this product" };

  // Verified purchase check
  const purchased = await Order.exists({ user: session.user.id, "items.product": productId, status: "delivered" });

  const review = await Review.create({
    product: productId, user: session.user.id,
    name: session.user.name, avatar: session.user.image,
    rating: data.rating, title: data.title, comment: data.comment,
    verifiedPurchase: !!purchased,
  });
  await recalcRating(productId);
  revalidatePath(`/products`);
  return { success: true, review: JSON.parse(JSON.stringify(review)) };
}

export async function editReview(reviewId: string, data: { rating: number; comment: string; title?: string }) {
  const session = await auth();
  if (!session?.user) return { error: "Login required" };
  await dbConnect();
  const review = await Review.findOne({ _id: reviewId, user: session.user.id });
  if (!review) return { error: "Not found" };
  Object.assign(review, data);
  await review.save();
  await recalcRating(review.product.toString());
  return { success: true, review: JSON.parse(JSON.stringify(review)) };
}

export async function deleteReview(reviewId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Login required" };
  await dbConnect();
  const review = await Review.findOne({ _id: reviewId, user: session.user.id });
  if (!review) return { error: "Not found" };
  const productId = review.product.toString();
  await review.deleteOne();
  await recalcRating(productId);
  return { success: true };
}
"use server";
import { revalidatePath } from "next/cache";
import { auth } from "../auth";
import { dbConnect } from "../lib/db";
import Category from "../models/Category";
import Coupon from "../models/Coupon";
import { slugify } from "../lib/utils";

async function admin() { const s = await auth(); if (s?.user?.role !== "admin") throw new Error("Unauthorized"); }

export async function createCategory(data: { name: string; slug?: string; description?: string; image?: any }) {
  await admin(); await dbConnect();
  const cat = await Category.create({ ...data, slug: data.slug || slugify(data.name) });
  revalidatePath("/admin/categories");
  return JSON.parse(JSON.stringify(cat));
}
export async function deleteCategory(id: string) {
  await admin(); await dbConnect();
  await Category.findByIdAndDelete(id);
  revalidatePath("/admin/categories");
  return { success: true };
}
export async function createCoupon(data: any) {
  await admin(); await dbConnect();
  const c = await Coupon.create({ ...data, code: data.code.toUpperCase() });
  revalidatePath("/admin/categories");
  return JSON.parse(JSON.stringify(c));
}
export async function deleteCoupon(id: string) {
  await admin(); await dbConnect();
  await Coupon.findByIdAndDelete(id);
  revalidatePath("/admin/categories");
  return { success: true };
}

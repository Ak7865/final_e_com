"use server";
import { revalidatePath } from "next/cache";
import { dbConnect } from "../lib/db";
import Product from "../models/Product";
import { auth } from "../auth";
import { slugify, generateSKU } from "../lib/utils";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") throw new Error("Unauthorized");
}

export async function createProduct(data: any) {
  await requireAdmin();
  await dbConnect();
  const product = await Product.create({
    ...data,
    slug: slugify(data.name) + "-" + Date.now().toString().slice(-4),
    sku: generateSKU(data.name),
  });
  revalidatePath("/admin/products");
  return JSON.parse(JSON.stringify(product));
}

export async function updateProduct(id: string, data: any) {
  await requireAdmin();
  await dbConnect();
  const product = await Product.findByIdAndUpdate(id, data, { new: true });
  revalidatePath("/admin/products");
  return JSON.parse(JSON.stringify(product));
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await dbConnect();
  await Product.findByIdAndDelete(id);
  revalidatePath("/admin/products");
  return { success: true };
}
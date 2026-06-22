"use server";
import { revalidatePath } from "next/cache";
import { auth } from "../auth";
import { dbConnect } from "../lib/db";
import User from "../models/User";

export async function updateProfile(data: { name?: string; phone?: string; image?: string; imagePublicId?: string }) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  await dbConnect();
  await User.findByIdAndUpdate(session.user.id, data);
  revalidatePath("/profile");
  return { success: true };
}

export async function addAddress(address: any) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  await dbConnect();
  const user = await User.findById(session.user.id);
  if (address.isDefault) user.addresses.forEach((a: any) => (a.isDefault = false));
  user.addresses.push(address);
  await user.save();
  revalidatePath("/profile");
  return { success: true, addresses: JSON.parse(JSON.stringify(user.addresses)) };
}

export async function deleteAddress(addressId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  await dbConnect();
  const user = await User.findById(session.user.id);
  user.addresses = user.addresses.filter((a: any) => a._id.toString() !== addressId);
  await user.save();
  revalidatePath("/profile");
  return { success: true };
}
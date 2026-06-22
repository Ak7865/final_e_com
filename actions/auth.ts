"use server";
import bcrypt from "bcryptjs";
import { dbConnect } from "../lib/db";
import User from "../models/User";
import { signIn } from "../auth";
import { registerSchema } from "../lib/validations";
import { AuthError } from "next-auth";
import { sendResetEmail } from "../services/email";
import crypto from "crypto";

export async function registerUser(values: unknown) {
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid fields" };
  const { name, email, password } = parsed.data;

  await dbConnect();
  const exists = await User.findOne({ email });
  if (exists) return { error: "Email already in use" };

  const hashed = await bcrypt.hash(password, 12);
  await User.create({ name, email, password: hashed, role: "customer" });
  return { success: "Account created! Please log in." };
}

export async function loginUser(email: string, password: string) {
  try {
    await signIn("credentials", { email, password, redirect: false });
    return { success: true };
  } catch (e) {
    if (e instanceof AuthError) return { error: "Invalid credentials" };
    throw e;
  }
}

export async function requestPasswordReset(email: string) {
  await dbConnect();
  const user = await User.findOne({ email });
  if (!user) return { success: "If the email exists, a reset link was sent." };
  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = token;
  user.resetTokenExpiry = new Date(Date.now() + 3600000);
  await user.save();
  await sendResetEmail(email, token);
  return { success: "Reset link sent to your email." };
}

export async function resetPassword(token: string, password: string) {
  await dbConnect();
  const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: new Date() } });
  if (!user) return { error: "Invalid or expired token" };
  user.password = await bcrypt.hash(password, 12);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();
  return { success: "Password updated. Please log in." };
}
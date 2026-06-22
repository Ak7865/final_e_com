import { NextResponse } from "next/server";
import { registerUser } from "@/actions/auth";
import { sanitizeNoSQL } from "@/lib/utils";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const body = await req.json();
  const result = await registerUser(sanitizeNoSQL(body));
  if (result.error) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const body = await req.json();

  const update: any = {};
  if (body.name) update.name = body.name.trim();
  if (body.phone !== undefined) update.phone = body.phone;
  if (body.image !== undefined) update.image = body.image;

  // Handle password change
  if (body.newPassword) {
    const user = await User.findById(session.user.id).select("+password");
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (!body.currentPassword) {
      return NextResponse.json({ error: "Current password is required" }, { status: 400 });
    }
    const valid = await bcrypt.compare(body.currentPassword, user.password || "");
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    update.password = await bcrypt.hash(body.newPassword, 12);
  }

  await User.findByIdAndUpdate(session.user.id, update);
  return NextResponse.json({ success: true });
}
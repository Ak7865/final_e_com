import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { file, folder } = await req.json(); // file = base64 data URI
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (typeof file !== "string" || !/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(file)) {
    return NextResponse.json({ error: "Only image data uploads are allowed" }, { status: 400 });
  }
  if (file.length > 7_000_000) {
    return NextResponse.json({ error: "Image is too large" }, { status: 413 });
  }

  const allowedFolders = session.user.role === "admin"
    ? new Set(["lumiere/products", "lumiere/avatars"])
    : new Set(["lumiere/avatars"]);
  const safeFolder = typeof folder === "string" && allowedFolders.has(folder) ? folder : "lumiere/avatars";

  const result = await uploadImage(file, safeFolder);
  return NextResponse.json(result);
}

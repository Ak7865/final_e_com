import { NextResponse } from "next/server";
import Papa from "papaparse";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import { auth } from "@/auth";
import { slugify, generateSKU, sanitizeNoSQL } from "@/lib/utils";

// EXPORT all products as CSV
export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const products = await Product.find().populate("category", "name").lean();
  const rows = products.map((p: any) => ({
    name: p.name, price: p.price, compareAtPrice: p.compareAtPrice || "",
    stock: p.stock, sku: p.sku, category: p.category?.name || "",
    description: p.description, isFeatured: p.isFeatured,
  }));
  const csv = Papa.unparse(rows);
  return new NextResponse(csv, {
    headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=products.csv" },
  });
}

// IMPORT (bulk upload) products from CSV
export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const { csv } = sanitizeNoSQL(await req.json());
  const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });

  const ops = (data as any[]).map((row) => ({
    updateOne: {
      filter: { sku: row.sku || `gen-${row.name}` },
      update: {
        $set: {
          name: row.name, price: +row.price, compareAtPrice: +row.compareAtPrice || undefined,
          stock: +row.stock || 0, description: row.description,
          slug: slugify(row.name) + "-" + Date.now().toString().slice(-4),
          sku: row.sku || generateSKU(row.name), isActive: true,
        },
      },
      upsert: true,
    },
  }));
  const result = await Product.bulkWrite(ops);
  return NextResponse.json({ success: true, inserted: result.upsertedCount, updated: result.modifiedCount });
}
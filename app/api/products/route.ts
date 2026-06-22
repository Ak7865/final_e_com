import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { escapeRegex } from "@/lib/utils";

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const q = searchParams.get("q");
  const category = searchParams.get("category");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const minRating = searchParams.get("minRating");
  const sort = searchParams.get("sort") || "-createdAt";

  const filter: any = { isActive: true };
  if (q) {
    const escapedQuery = escapeRegex(q);
    const matchedCats = await Category.find({
      $or: [
        { name: { $regex: escapedQuery, $options: "i" } },
        { description: { $regex: escapedQuery, $options: "i" } }
      ]
    }).select("_id").lean();
    const matchedCategoryIds = matchedCats.map((c: any) => c._id);

    filter.$or = [
      { name: { $regex: escapedQuery, $options: "i" } },
      { description: { $regex: escapedQuery, $options: "i" } },
      { brand: { $regex: escapedQuery, $options: "i" } },
      { sku: { $regex: escapedQuery, $options: "i" } },
      { tags: { $regex: escapedQuery, $options: "i" } },
      { skinType: { $regex: escapedQuery, $options: "i" } },
      { benefits: { $regex: escapedQuery, $options: "i" } },
      { ingredients: { $regex: escapedQuery, $options: "i" } }
    ];

    if (matchedCategoryIds.length > 0) {
      filter.$or.push({ category: { $in: matchedCategoryIds } });
    }
  }
  if (category) filter.category = category;
  if (minPrice || maxPrice) filter.price = { ...(minPrice && { $gte: +minPrice }), ...(maxPrice && { $lte: +maxPrice }) };
  if (minRating) filter.rating = { $gte: +minRating };

  const [products, total] = await Promise.all([
    Product.find(filter).populate("category", "name slug").sort(sort).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  return NextResponse.json({ products, total, pages: Math.ceil(total / limit), page });
}
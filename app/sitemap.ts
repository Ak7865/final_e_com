import { MetadataRoute } from "next";
import { dbConnect } from "@/lib/db";
import { getSiteUrl } from "@/lib/site";
import Product from "@/models/Product";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  // Static routes
  const routes = [
    "",
    "/products",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  try {
    if (!process.env.MONGODB_URI || process.env.NEXT_PHASE === "phase-production-build") return routes;
    await dbConnect();
    // Retrieve active product slugs for dynamic routes
    const products = await Product.find({ isActive: true }).select("slug updatedAt").lean();
    const productRoutes = products.map((p: any) => ({
      url: `${baseUrl}/products/${p.slug}`,
      lastModified: new Date(p.updatedAt || Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
    return [...routes, ...productRoutes];
  } catch (e) {
    console.error("Failed to generate dynamic sitemap routes:", e);
    return routes;
  }
}

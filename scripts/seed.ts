import { config } from "dotenv";
config({ path: ".env.local" });

const categories = [
  { name: "Serums", description: "Concentrated treatments" },
  { name: "Moisturizers", description: "Hydration & barrier care" },
  { name: "Cleansers", description: "Gentle daily cleansing" },
  { name: "Masks", description: "Weekly skin rituals" },
  { name: "Sunscreen", description: "Daily UV protection" },
  { name: "Eye Care", description: "Targeted eye treatments" },
];

const sampleProducts = [
  { name: "Vitamin C Brightening Serum", cat: "Serums", price: 68, compareAtPrice: 85, desc: "A potent 15% vitamin C serum that brightens, evens tone, and boosts radiance with hyaluronic acid.", skinType: ["All", "Dull"], featured: true, best: true, benefits: ["Brightening", "Antioxidant", "Even tone"] },
  { name: "Hyaluronic Hydra Boost Serum", cat: "Serums", price: 54, desc: "Multi-molecular hyaluronic acid delivers deep, lasting hydration for plump, dewy skin.", skinType: ["Dry", "All"], featured: true, trending: true, benefits: ["Hydration", "Plumping"] },
  { name: "Rose Quartz Day Moisturizer", cat: "Moisturizers", price: 62, compareAtPrice: 72, desc: "Lightweight whipped cream with rosehip oil and ceramides for all-day comfort.", skinType: ["Normal", "Combination"], best: true, benefits: ["Hydration", "Barrier repair"] },
  { name: "Midnight Recovery Night Cream", cat: "Moisturizers", price: 78, desc: "Rich overnight balm with retinol alternative bakuchiol and squalane.", skinType: ["Dry", "Mature"], featured: true, benefits: ["Anti-aging", "Repair"] },
  { name: "Botanical Gel Cleanser", cat: "Cleansers", price: 32, desc: "Sulfate-free gel cleanser with green tea and aloe that purifies without stripping.", skinType: ["All", "Oily"], trending: true, benefits: ["Gentle", "Purifying"] },
  { name: "Clay Detox Mask", cat: "Masks", price: 44, desc: "French green clay & charcoal mask that draws out impurities and refines pores.", skinType: ["Oily", "Combination"], best: true, benefits: ["Detox", "Pore-refining"] },
  { name: "Mineral Glow SPF 50", cat: "Sunscreen", price: 48, desc: "Reef-safe mineral sunscreen with a luminous finish and zero white cast.", skinType: ["All"], featured: true, benefits: ["SPF 50", "No white cast"] },
  { name: "Caffeine Eye Renewal Cream", cat: "Eye Care", price: 52, compareAtPrice: 60, desc: "De-puffing eye cream with caffeine and peptides to brighten dark circles.", skinType: ["All"], trending: true, benefits: ["De-puffing", "Brightening"] },
];

async function seed() {
  const bcrypt = await import("bcryptjs").then(m => m.default);
  const { dbConnect } = await import("../lib/db");
  const User = await import("../models/User").then(m => m.default);
  const Category = await import("../models/Category").then(m => m.default);
  const Product = await import("../models/Product").then(m => m.default);
  const { slugify, generateSKU } = await import("../lib/utils");

  await dbConnect();
  await Promise.all([User.deleteMany({}), Category.deleteMany({}), Product.deleteMany({})]);

  // Admin + demo customer
  await User.create([
    { name: "Admin", email: "admin@lumiere.com", password: await bcrypt.hash("Admin@1234", 12), role: "admin" },
    { name: "Sophie Customer", email: "customer@lumiere.com", password: await bcrypt.hash("Customer@1234", 12), role: "customer" },
  ]);

  const cats = await Category.insertMany(
    categories.map((c) => ({ ...c, slug: slugify(c.name) }))
  );
  const catMap = Object.fromEntries(cats.map((c) => [c.name, c._id]));

  await Product.insertMany(
    sampleProducts.map((p) => ({
      name: p.name,
      slug: slugify(p.name),
      description: p.desc,
      shortDescription: p.desc.slice(0, 80),
      category: catMap[p.cat],
      sku: generateSKU(p.name),
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      discount: p.compareAtPrice ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100) : 0,
      images: [{ url: "https://res.cloudinary.com/demo/image/upload/sample.jpg", publicId: "sample" }],
      stock: Math.floor(Math.random() * 100) + 5,
      skinType: p.skinType,
      benefits: p.benefits,
      isFeatured: !!p.featured,
      isBestSeller: !!p.best,
      isTrending: !!p.trending,
      rating: +(Math.random() * 1.5 + 3.5).toFixed(1),
      numReviews: Math.floor(Math.random() * 200),
      soldCount: Math.floor(Math.random() * 500),
    }))
  );

  console.log("✅ Seed complete!  Admin: admin@lumiere.com / Admin@1234");
  process.exit(0);
}
seed();
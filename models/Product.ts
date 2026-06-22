import { Schema, model, models } from "mongoose";

const VariantSchema = new Schema({
  name: String,        // e.g. "50ml", "100ml"
  sku: String,
  price: Number,
  stock: { type: Number, default: 0 },
});

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    shortDescription: String,
    brand: { type: String, default: "Lumière" },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    sku: { type: String, unique: true },
    price: { type: Number, required: true },
    compareAtPrice: Number,       // original price for discount display
    discount: { type: Number, default: 0 }, // %
    images: [{ url: String, publicId: String }],
    variants: [VariantSchema],
    stock: { type: Number, default: 0 },
    ingredients: [String],
    skinType: [String],            // "Dry","Oily","Combination","Sensitive"
    benefits: [String],
    howToUse: String,
    tags: [String],
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", description: "text", tags: "text" });

export default models.Product || model("Product", ProductSchema);
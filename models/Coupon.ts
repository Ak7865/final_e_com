// models/Coupon.ts
import { Schema, model, models } from "mongoose";
const CouponSchema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ["percent", "fixed"], default: "percent" },
  value: Number,
  minPurchase: { type: Number, default: 0 },
  maxDiscount: Number,
  expiresAt: Date,
  usageLimit: { type: Number, default: 0 },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
export default models.Coupon || model("Coupon", CouponSchema);
import { Schema, model, models } from "mongoose";

const ReviewSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: String,
    avatar: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: String,
    comment: String,
    verifiedPurchase: { type: Boolean, default: false },
    helpful: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

export default models.Review || model("Review", ReviewSchema);
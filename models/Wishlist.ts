// models/Wishlist.ts
import { Schema, model, models } from "mongoose";
const WishlistSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", unique: true },
  products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
}, { timestamps: true });
export default models.Wishlist || model("Wishlist", WishlistSchema);
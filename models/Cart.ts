// models/Cart.ts
import { Schema, model, models } from "mongoose";
const CartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", unique: true },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    variant: String, quantity: { type: Number, default: 1 },
  }],
}, { timestamps: true });
export default models.Cart || model("Cart", CartSchema);
// models/Notification.ts
import { Schema, model, models } from "mongoose";
const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" }, // null = admin broadcast
  audience: { type: String, enum: ["customer", "admin"], default: "customer" },
  type: String,    // order_placed, low_stock, shipped, etc.
  title: String,
  message: String,
  link: String,
  read: { type: Boolean, default: false },
}, { timestamps: true });
export default models.Notification || model("Notification", NotificationSchema);
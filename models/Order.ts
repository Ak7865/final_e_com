import { Schema, model, models } from "mongoose";

const OrderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product" },
  name: String,
  image: String,
  variant: String,
  sku: String,
  price: Number,
  quantity: Number,
});

export const ORDER_STATUSES = [
  "pending", "confirmed", "processing", "packed",
  "shipped", "out_for_delivery", "delivered", "cancelled", "refunded",
] as const;

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [OrderItemSchema],
    shippingAddress: {
      fullName: String, phone: String, line1: String, line2: String,
      city: String, state: String, postalCode: String, country: String,
    },
    subtotal: Number,
    tax: Number,
    shippingFee: Number,
    discount: { type: Number, default: 0 },
    couponCode: String,
    total: Number,
    paymentMethod: { type: String, enum: ["cod", "online"], default: "cod" },
    paymentStatus: { type: String, enum: ["pending", "paid", "refunded", "failed"], default: "pending" },
    status: { type: String, enum: ORDER_STATUSES, default: "pending" },
    trackingId: String,
    deliveryEstimate: Date,
    statusHistory: [{ status: String, date: { type: Date, default: Date.now }, note: String }],
    cancelReason: String,
    refundAmount: Number,
  },
  { timestamps: true }
);

OrderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    this.orderNumber = `LUM-${Date.now().toString().slice(-8)}`;
  }
  next();
});

export default models.Order || model("Order", OrderSchema);
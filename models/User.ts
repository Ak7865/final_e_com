import mongoose, { Schema, model, models } from "mongoose";

const AddressSchema = new Schema({
  fullName: String,
  phone: String,
  line1: String,
  line2: String,
  city: String,
  state: String,
  postalCode: String,
  country: { type: String, default: "USA" },
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    image: { type: String, default: "" },
    imagePublicId: String,
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    provider: { type: String, default: "credentials" },
    phone: String,
    addresses: [AddressSchema],
    emailVerified: Date,
    resetToken: String,
    resetTokenExpiry: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.User || model("User", UserSchema);
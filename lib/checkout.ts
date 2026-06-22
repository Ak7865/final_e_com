export const TAX_RATE = 0.08; // 8%
export const FREE_SHIPPING_THRESHOLD = 75;
export const STANDARD_SHIPPING = 6.99;

export function calculateTotals(subtotal: number, discount = 0) {
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * TAX_RATE * 100) / 100;
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const total = Math.round((taxable + tax + shippingFee) * 100) / 100;
  return { tax, shippingFee, total };
}
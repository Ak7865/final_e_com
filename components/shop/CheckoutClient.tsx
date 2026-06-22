"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Truck, Tag, CreditCard, Wallet, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { addressSchema } from "@/lib/validations";
import { calculateTotals, FREE_SHIPPING_THRESHOLD } from "@/lib/checkout";
import { validateCoupon } from "@/actions/coupon";
import { placeOrder } from "@/actions/order";
import { formatPrice } from "@/lib/utils";
import Script from "next/script";

export function CheckoutClient({ savedAddresses }: { savedAddresses: any[] }) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [pending, startTransition] = useTransition();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [selectedAddr, setSelectedAddr] = useState(savedAddresses.find((a) => a.isDefault)?._id || "new");

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: savedAddresses.find((a) => a.isDefault) || {},
  });

  const sub = subtotal();
  const { tax, shippingFee, total } = calculateTotals(sub, discount);

  const applyCoupon = async () => {
    if (!couponCode) return;
    const res = await validateCoupon(couponCode, sub);
    if (res.error) return toast.error(res.error);
    setDiscount(res.discount!);
    setAppliedCoupon(res.code!);
    toast.success(`Coupon applied! -${formatPrice(res.discount!)}`);
  };

  const onSubmit = (formData: any) => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    startTransition(async () => {
      const shippingAddress =
        selectedAddr !== "new"
          ? savedAddresses.find((a) => a._id === selectedAddr)
          : formData;

      if (paymentMethod === "online" && !(window as any).Razorpay) {
        toast.error("Razorpay SDK is still loading. Please try again in a few seconds.");
        return;
      }

      const res = await placeOrder({
        items: items.map((i) => ({
          product: i.productId, name: i.name, image: i.image,
          variant: i.variant, price: i.price, quantity: i.quantity,
        })),
        shippingAddress,
        paymentMethod,
        subtotal: sub, tax, shippingFee, discount,
        couponCode: appliedCoupon || undefined,
        total,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      if (paymentMethod === "online") {
        try {
          // Create Razorpay Order
          const rpRes = await fetch("/api/razorpay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: res.orderId }),
          });
          const rpOrder = await rpRes.json();
          
          if (rpOrder.error) {
            toast.error(rpOrder.error || "Failed to initiate online payment");
            router.push(`/orders/${res.orderId}`);
            return;
          }

          // Open Razorpay Checkout Modal
          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
            amount: rpOrder.amount,
            currency: rpOrder.currency,
            name: "Lumière Skincare",
            description: `Payment for Order ${rpOrder.receipt}`,
            order_id: rpOrder.id,
            handler: async function (response: any) {
              toast.loading("Verifying payment transaction...", { id: "rp-verify" });
              try {
                const verifyRes = await fetch("/api/razorpay/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                    localOrderId: res.orderId,
                  }),
                });
                const verifyData = await verifyRes.json();
                if (verifyData.success) {
                   clearCart();
                   toast.success("Payment verified & order placed! 🎉", { id: "rp-verify" });
                } else {
                   toast.error(verifyData.error || "Payment verification failed.", { id: "rp-verify" });
                }
              } catch (err) {
                toast.error("Failed to verify transaction signature.", { id: "rp-verify" });
              } finally {
                router.push(`/orders/${res.orderId}`);
              }
            },
            prefill: {
              name: shippingAddress.fullName || "",
              contact: shippingAddress.phone || "",
            },
            theme: {
              color: "#5d6e53",
            },
            modal: {
              ondismiss: function () {
                toast.warning("Payment modal closed. Your order remains pending.");
                router.push(`/orders/${res.orderId}`);
              },
            },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } catch (err) {
          toast.error("An error occurred opening the payment window.");
          router.push(`/orders/${res.orderId}`);
        }
      } else {
        // Cash on Delivery flow
        clearCart();
        toast.success("Order placed successfully! 🎉");
        router.push(`/orders/${res.orderId}`);
      }
    });
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-500 mb-4">Your cart is empty.</p>
        <Button onClick={() => router.push("/products")}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8">
      {/* LEFT: Address + Payment */}
      <div className="lg:col-span-2 space-y-8">
        {/* Shipping Address */}
        <section className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-sm">
          <h2 className="font-medium text-lg mb-4 flex items-center gap-2"><Truck className="h-5 w-5 text-sage-600" /> Shipping Address</h2>

          {savedAddresses.length > 0 && (
            <div className="space-y-3 mb-4">
              {savedAddresses.map((a) => (
                <label key={a._id} className={`block border rounded-xl p-4 cursor-pointer transition ${selectedAddr === a._id ? "border-sage-600 bg-sage-50" : "border-stone-200"}`}>
                  <input type="radio" name="addr" className="sr-only" checked={selectedAddr === a._id} onChange={() => setSelectedAddr(a._id)} />
                  <p className="font-medium">{a.fullName} · {a.phone}</p>
                  <p className="text-sm text-stone-500">{a.line1}, {a.city}, {a.state} {a.postalCode}</p>
                </label>
              ))}
              <label className={`block border rounded-xl p-4 cursor-pointer ${selectedAddr === "new" ? "border-sage-600 bg-sage-50" : "border-stone-200"}`}>
                <input type="radio" name="addr" className="sr-only" checked={selectedAddr === "new"} onChange={() => setSelectedAddr("new")} />
                <span className="font-medium">+ Use a new address</span>
              </label>
            </div>
          )}

          {(selectedAddr === "new" || savedAddresses.length === 0) && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full Name" {...register("fullName")} error={errors.fullName} />
              <Field label="Phone" {...register("phone")} error={errors.phone} />
              <Field label="Address Line 1" className="sm:col-span-2" {...register("line1")} error={errors.line1} />
              <Field label="Address Line 2 (optional)" className="sm:col-span-2" {...register("line2")} />
              <Field label="City" {...register("city")} error={errors.city} />
              <Field label="State" {...register("state")} error={errors.state} />
              <Field label="Postal Code" {...register("postalCode")} error={errors.postalCode} />
              <Field label="Country" {...register("country")} />
            </div>
          )}
        </section>

        {/* Payment Method */}
        <section className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-sm">
          <h2 className="font-medium text-lg mb-4 flex items-center gap-2"><CreditCard className="h-5 w-5 text-sage-600" /> Payment Method</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <button type="button" onClick={() => setPaymentMethod("cod")} className={`flex items-center gap-3 border rounded-xl p-4 ${paymentMethod === "cod" ? "border-sage-600 bg-sage-50" : "border-stone-200"}`}>
              <Wallet className="h-5 w-5 text-sage-600" />
              <span>Cash on Delivery</span>
              {paymentMethod === "cod" && <Check className="h-4 w-4 ml-auto text-sage-600" />}
            </button>
            <button type="button" onClick={() => setPaymentMethod("online")} className={`flex items-center gap-3 border rounded-xl p-4 ${paymentMethod === "online" ? "border-sage-600 bg-sage-50" : "border-stone-200"}`}>
              <CreditCard className="h-5 w-5 text-sage-600" />
              <span>Online Payment</span>
              {paymentMethod === "online" && <Check className="h-4 w-4 ml-auto text-sage-600" />}
            </button>
          </div>
          {paymentMethod === "online" && (
            <p className="text-xs text-stone-400 mt-3">⚡ Payment gateway placeholder — integrate Stripe/Razorpay here.</p>
          )}
        </section>
      </div>

      {/* RIGHT: Order Summary */}
      <aside className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-sm h-fit sticky top-24">
        <h2 className="font-medium text-lg mb-4">Order Summary</h2>
        <div className="space-y-3 max-h-60 overflow-auto no-scrollbar mb-4">
          {items.map((i) => (
            <div key={i.productId + i.variant} className="flex gap-3 text-sm">
              <div className="h-14 w-14 rounded-lg bg-cream-100 bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${i.image})` }} />
              <div className="flex-1">
                <p className="line-clamp-1">{i.name}</p>
                <p className="text-stone-400">Qty {i.quantity}{i.variant ? ` · ${i.variant}` : ""}</p>
              </div>
              <span>{formatPrice(i.price * i.quantity)}</span>
            </div>
          ))}
        </div>

        {/* Coupon */}
        <div className="flex gap-2 mb-4">
          <div className="flex items-center bg-cream-100 dark:bg-stone-800 rounded-full px-4 flex-1">
            <Tag className="h-4 w-4 text-stone-400" />
            <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Coupon code" className="bg-transparent px-2 py-2.5 outline-none text-sm w-full" />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={applyCoupon}>Apply</Button>
        </div>

        <div className="space-y-2 text-sm border-t border-stone-100 dark:border-stone-800 pt-4">
          <Row label="Subtotal" value={formatPrice(sub)} />
          {discount > 0 && <Row label={`Discount (${appliedCoupon})`} value={`-${formatPrice(discount)}`} green />}
          <Row label="Tax (8%)" value={formatPrice(tax)} />
          <Row label="Shipping" value={shippingFee === 0 ? "FREE" : formatPrice(shippingFee)} />
          {sub < FREE_SHIPPING_THRESHOLD && (
            <p className="text-xs text-sage-600">Add {formatPrice(FREE_SHIPPING_THRESHOLD - sub)} more for free shipping!</p>
          )}
          <div className="flex justify-between font-semibold text-base pt-2 border-t border-stone-100 dark:border-stone-800">
            <span>Total</span><span>{formatPrice(total)}</span>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full mt-6" disabled={pending}>
          {pending ? "Placing Order..." : `Place Order · ${formatPrice(total)}`}
        </Button>
      </aside>
    </form>
    </>
  );
}

const Field = ({ label, error, className, ...props }: any) => (
  <div className={className}>
    <label className="text-xs text-stone-500 mb-1 block">{label}</label>
    <input {...props} className="w-full h-11 px-4 rounded-xl bg-cream-100 dark:bg-stone-800 outline-none focus:ring-2 ring-sage-400 text-sm" />
    {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
  </div>
);

const Row = ({ label, value, green }: { label: string; value: string; green?: boolean }) => (
  <div className="flex justify-between"><span className="text-stone-500">{label}</span><span className={green ? "text-green-600" : ""}>{value}</span></div>
);

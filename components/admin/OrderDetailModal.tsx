"use client";
import { useState, useTransition } from "react";
import { X, Printer, Ban, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateOrderStatus, cancelOrder, refundOrder } from "@/actions/order";
import { formatPrice } from "@/lib/utils";

const STATUSES = ["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered"];

export function OrderDetailModal({ order, onClose, onUpdate }: any) {
  const [status, setStatus] = useState(order.status);
  const [trackingId, setTrackingId] = useState(order.trackingId || "");
  const [deliveryEstimate, setDeliveryEstimate] = useState(order.deliveryEstimate?.slice(0, 10) || "");
  const [pending, startTransition] = useTransition();

  const save = () => startTransition(async () => {
    const res = await updateOrderStatus(order._id, status, { trackingId, deliveryEstimate: deliveryEstimate ? new Date(deliveryEstimate) : undefined });
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Order updated");
    onUpdate({ _id: order._id, status, trackingId, deliveryEstimate });
  });

  const cancel = () => {
    const reason = prompt("Cancellation reason?");
    if (!reason) return;
    startTransition(async () => {
      await cancelOrder(order._id, reason);
      toast.success("Order cancelled");
      onUpdate({ _id: order._id, status: "cancelled" });
    });
  };

  const refund = () => {
    const amt = prompt("Refund amount?", String(order.total));
    if (!amt) return;
    startTransition(async () => {
      await refundOrder(order._id, +amt);
      toast.success("Refund processed");
      onUpdate({ _id: order._id, status: "refunded" });
    });
  };

  const printInvoice = () => {
    const w = window.open("", "_blank");
    w!.document.write(`
      <html><head><title>Invoice ${order.orderNumber}</title>
      <style>body{font-family:sans-serif;padding:40px;color:#333}h1{color:#5b6b52}table{width:100%;border-collapse:collapse;margin-top:20px}td,th{border-bottom:1px solid #eee;padding:8px;text-align:left}</style>
      </head><body>
      <h1>Lumière — Invoice</h1>
      <p><b>Order:</b> ${order.orderNumber}<br/><b>Date:</b> ${new Date(order.createdAt).toLocaleDateString()}<br/><b>Customer:</b> ${order.user?.name}</p>
      <p><b>Ship to:</b><br/>${order.shippingAddress.fullName}<br/>${order.shippingAddress.line1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</p>
      <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>
      ${order.items.map((i: any) => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>$${i.price}</td><td>$${(i.price * i.quantity).toFixed(2)}</td></tr>`).join("")}
      </tbody></table>
      <p style="text-align:right;margin-top:20px">Subtotal: $${order.subtotal}<br/>Tax: $${order.tax}<br/>Shipping: $${order.shippingFee}<br/><b>Total: $${order.total}</b></p>
      </body></html>`);
    w!.document.close(); w!.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4 overflow-auto">
      <div className="bg-white dark:bg-stone-900 rounded-2xl w-full max-w-2xl my-8 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-stone-100 sticky top-0 bg-white dark:bg-stone-900 z-10">
          <div><h2 className="font-serif text-2xl">{order.orderNumber}</h2><p className="text-sm text-stone-500">{order.user?.email}</p></div>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Items */}
          <div>
            <h3 className="font-medium mb-3">Items</h3>
            {order.items.map((i: any) => (
              <div key={i.product} className="flex justify-between py-2 text-sm border-b border-stone-50">
                <span>{i.name} × {i.quantity}</span><span>{formatPrice(i.price * i.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold pt-3"><span>Total</span><span>{formatPrice(order.total)}</span></div>
          </div>

          {/* Status update */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-cream-100 dark:bg-stone-800 text-sm outline-none capitalize">
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tracking ID</label>
              <input value={trackingId} onChange={(e) => setTrackingId(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-cream-100 dark:bg-stone-800 text-sm outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Delivery Estimate</label>
              <input type="date" value={deliveryEstimate} onChange={(e) => setDeliveryEstimate(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-cream-100 dark:bg-stone-800 text-sm outline-none" />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button onClick={save} disabled={pending}>Update Order</Button>
            <Button variant="outline" onClick={printInvoice}><Printer className="h-4 w-4" /> Invoice</Button>
            <Button variant="destructive" onClick={cancel}><Ban className="h-4 w-4" /> Cancel</Button>
            <Button variant="outline" onClick={refund}><RotateCcw className="h-4 w-4" /> Refund</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

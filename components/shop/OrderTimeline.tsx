"use client";
import { motion } from "framer-motion";
import { Check, Package, Truck, Home, Clock, X } from "lucide-react";
import { FormattedDate } from "@/components/ui/FormattedDate";

const STEPS = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: Check },
  { key: "processing", label: "Processing", icon: Package },
  { key: "packed", label: "Packed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
];

export function OrderTimeline({ currentStatus, trackingId, deliveryEstimate }: any) {
  if (currentStatus === "cancelled" || currentStatus === "refunded") {
    return (
      <div className="bg-red-50 rounded-2xl p-6 flex items-center gap-3 text-red-600">
        <X className="h-6 w-6" />
        <p className="font-medium capitalize">Order {currentStatus}</p>
      </div>
    );
  }
  const currentIdx = STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-sm">
      {trackingId && <p className="text-sm mb-4">Tracking ID: <span className="font-medium text-sage-600">{trackingId}</span></p>}
      {deliveryEstimate && <p className="text-sm mb-4 text-stone-500">Est. Delivery: <FormattedDate date={deliveryEstimate} /></p>}
      <div className="flex justify-between relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-stone-100" />
        <motion.div initial={{ width: 0 }} animate={{ width: `${(currentIdx / (STEPS.length - 1)) * 100}%` }} className="absolute top-5 left-0 h-0.5 bg-sage-600" />
        {STEPS.map((step, i) => {
          const done = i <= currentIdx;
          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center flex-1">
              <div className={`h-10 w-10 rounded-full grid place-items-center ${done ? "bg-sage-600 text-white" : "bg-stone-100 text-stone-400"}`}>
                <step.icon className="h-4 w-4" />
              </div>
              <span className={`text-[10px] mt-2 text-center ${done ? "text-sage-600 font-medium" : "text-stone-400"}`}>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
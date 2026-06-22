import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);

export const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");

export const generateSKU = (name: string) =>
  `${name.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;

export const escapeRegex = (text: string) =>
  text.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

export function sanitizeNoSQL(v: any): any {
  if (v instanceof Array) {
    for (let i = 0; i < v.length; i++) {
      v[i] = sanitizeNoSQL(v[i]);
    }
  } else if (v !== null && typeof v === "object") {
    for (const k in v) {
      if (k.startsWith("$")) {
        delete v[k];
      } else {
        v[k] = sanitizeNoSQL(v[k]);
      }
    }
  }
  return v;
}
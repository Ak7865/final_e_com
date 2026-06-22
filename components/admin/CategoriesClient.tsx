"use client";
import { useState, useTransition } from "react";
import { Plus, Trash2, Tag, Edit2, Check, X, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createCategory, deleteCategory, createCoupon, deleteCoupon } from "@/actions/category";
import { formatPrice } from "@/lib/utils";

export function CategoriesClient({ initCategories, initCoupons }: any) {
  const [categories, setCategories] = useState(initCategories);
  const [coupons, setCoupons] = useState(initCoupons);

  // Category form
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [editingCat, setEditingCat] = useState<any>(null);

  // Coupon form
  const [coupon, setCoupon] = useState({
    code: "",
    type: "percent",
    value: 10,
    minPurchase: 0,
    isActive: true,
  });
  const [couponExpiry, setCouponExpiry] = useState("");

  const [pending, startTransition] = useTransition();

  const slugify = (text: string) =>
    text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");

  const addCat = () => {
    if (!catName) return toast.error("Category name is required");
    startTransition(async () => {
      const c = await createCategory({
        name: catName,
        description: catDesc,
        slug: catSlug || slugify(catName),
      });
      setCategories((p: any[]) => [c, ...p]);
      setCatName("");
      setCatDesc("");
      setCatSlug("");
      toast.success("Category added");
    });
  };

  const delCat = (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Products in this category will be affected.`)) return;
    startTransition(async () => {
      await deleteCategory(id);
      setCategories((p: any[]) => p.filter((c) => c._id !== id));
      toast.success("Category deleted");
    });
  };

  const addCoupon = () => {
    if (!coupon.code) return toast.error("Coupon code is required");
    startTransition(async () => {
      const c = await createCoupon({
        ...coupon,
        code: coupon.code.toUpperCase(),
        expiresAt: couponExpiry ? new Date(couponExpiry) : undefined,
      });
      setCoupons((p: any[]) => [c, ...p]);
      setCoupon({ code: "", type: "percent", value: 10, minPurchase: 0, isActive: true });
      setCouponExpiry("");
      toast.success("Coupon created");
    });
  };

  const delCoupon = (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    startTransition(async () => {
      await deleteCoupon(id);
      setCoupons((p: any[]) => p.filter((c) => c._id !== id));
      toast.success("Coupon deleted");
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl text-stone-900 dark:text-stone-100">
        Categories &amp; Coupons
      </h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* ── CATEGORIES ── */}
        <section className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-800">
          <h2 className="font-medium text-lg mb-5 text-stone-800 dark:text-stone-200">
            Product Categories
          </h2>

          {/* Add Category Form */}
          <div className="space-y-3 mb-6 p-4 bg-cream-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">New Category</p>
            <input
              value={catName}
              onChange={(e) => { setCatName(e.target.value); setCatSlug(slugify(e.target.value)); }}
              placeholder="Category name *"
              className="w-full h-11 px-4 rounded-xl bg-white dark:bg-stone-800 text-sm outline-none border border-stone-200 dark:border-stone-700 focus:ring-2 ring-sage-400"
            />
            <input
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full h-11 px-4 rounded-xl bg-white dark:bg-stone-800 text-sm outline-none border border-stone-200 dark:border-stone-700 focus:ring-2 ring-sage-400"
            />
            <input
              value={catSlug}
              onChange={(e) => setCatSlug(e.target.value)}
              placeholder="Slug (auto-generated)"
              className="w-full h-11 px-4 rounded-xl bg-white dark:bg-stone-800 text-sm outline-none border border-stone-200 dark:border-stone-700 focus:ring-2 ring-sage-400 font-mono text-xs"
            />
            <Button onClick={addCat} disabled={pending} className="w-full gap-2">
              <Plus className="h-4 w-4" /> Add Category
            </Button>
          </div>

          {/* Categories List */}
          <div className="space-y-2">
            {categories.length === 0 && (
              <p className="text-stone-400 text-sm text-center py-6">
                No categories yet. Add your first one above.
              </p>
            )}
            {categories.map((c: any) => (
              <div
                key={c._id}
                className="flex items-center justify-between p-4 bg-cream-50 dark:bg-stone-800/40 rounded-xl group border border-transparent hover:border-stone-200 dark:hover:border-stone-700 transition"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">{c.name}</p>
                  {c.description && (
                    <p className="text-xs text-stone-400 truncate mt-0.5">{c.description}</p>
                  )}
                  <p className="text-[10px] text-stone-300 dark:text-stone-600 font-mono mt-0.5">
                    /{c.slug}
                  </p>
                </div>
                <button
                  onClick={() => delCat(c._id, c.name)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg opacity-0 group-hover:opacity-100 transition ml-2"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── COUPONS ── */}
        <section className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-800">
          <h2 className="font-medium text-lg mb-5 text-stone-800 dark:text-stone-200">
            Discount Coupons
          </h2>

          {/* Add Coupon Form */}
          <div className="space-y-3 mb-6 p-4 bg-cream-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">New Coupon</p>
            <div className="grid grid-cols-2 gap-3">
              <input
                value={coupon.code}
                onChange={(e) => setCoupon({ ...coupon, code: e.target.value.toUpperCase() })}
                placeholder="COUPON CODE *"
                className="h-11 px-4 rounded-xl bg-white dark:bg-stone-800 text-sm outline-none border border-stone-200 dark:border-stone-700 focus:ring-2 ring-sage-400 font-mono tracking-widest uppercase"
              />
              <select
                value={coupon.type}
                onChange={(e) => setCoupon({ ...coupon, type: e.target.value })}
                className="h-11 px-4 rounded-xl bg-white dark:bg-stone-800 text-sm outline-none border border-stone-200 dark:border-stone-700"
              >
                <option value="percent">Percent %</option>
                <option value="fixed">Fixed $</option>
              </select>
              <div className="relative">
                <input
                  type="number"
                  value={coupon.value}
                  onChange={(e) => setCoupon({ ...coupon, value: +e.target.value })}
                  placeholder="Value"
                  min={0}
                  className="w-full h-11 px-4 rounded-xl bg-white dark:bg-stone-800 text-sm outline-none border border-stone-200 dark:border-stone-700"
                />
                <span className="absolute right-3 top-3 text-stone-400 text-sm">
                  {coupon.type === "percent" ? "%" : "$"}
                </span>
              </div>
              <input
                type="number"
                value={coupon.minPurchase}
                onChange={(e) => setCoupon({ ...coupon, minPurchase: +e.target.value })}
                placeholder="Min purchase $"
                min={0}
                className="h-11 px-4 rounded-xl bg-white dark:bg-stone-800 text-sm outline-none border border-stone-200 dark:border-stone-700"
              />
            </div>
            <input
              type="date"
              value={couponExpiry}
              onChange={(e) => setCouponExpiry(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-white dark:bg-stone-800 text-sm outline-none border border-stone-200 dark:border-stone-700"
            />
            <Button onClick={addCoupon} disabled={pending} className="w-full gap-2">
              <Tag className="h-4 w-4" /> Create Coupon
            </Button>
          </div>

          {/* Coupons List */}
          <div className="space-y-2">
            {coupons.length === 0 && (
              <p className="text-stone-400 text-sm text-center py-6">
                No coupons yet. Create your first discount above.
              </p>
            )}
            {coupons.map((c: any) => (
              <div
                key={c._id}
                className="flex items-center justify-between p-4 bg-cream-50 dark:bg-stone-800/40 rounded-xl group border border-transparent hover:border-stone-200 dark:hover:border-stone-700 transition"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-9 w-9 rounded-lg bg-gold-50 dark:bg-gold-950/20 grid place-items-center">
                    <Tag className="h-4 w-4 text-gold-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono font-bold text-sm text-stone-800 dark:text-stone-200 tracking-widest">
                      {c.code}
                    </p>
                    <p className="text-xs text-stone-500">
                      {c.type === "percent" ? `${c.value}% off` : `${formatPrice(c.value)} off`}
                      {c.minPurchase > 0 && ` · min ${formatPrice(c.minPurchase)}`}
                      {c.expiresAt && ` · expires ${new Date(c.expiresAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      c.isActive
                        ? "bg-green-50 text-green-600 dark:bg-green-950/20"
                        : "bg-stone-100 text-stone-400"
                    }`}
                  >
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={() => delCoupon(c._id, c.code)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg opacity-0 group-hover:opacity-100 transition ml-1"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
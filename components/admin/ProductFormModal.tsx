"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Upload, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { productSchema } from "@/lib/validations";
import { createProduct, updateProduct } from "@/actions/product";

const SKIN_TYPES = ["All", "Dry", "Oily", "Combination", "Sensitive", "Mature"];

export function ProductFormModal({ product, categories, onClose, onSaved }: any) {
  const [pending, startTransition] = useTransition();
  const [images, setImages] = useState<{ url: string; publicId: string }[]>(product?.images || []);
  const [uploading, setUploading] = useState(false);
  const [variants, setVariants] = useState<any[]>(product?.variants || []);
  const [skinType, setSkinType] = useState<string[]>(product?.skinType || []);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? { name: product.name, description: product.description, category: product.category?._id || product.category, price: product.price, compareAtPrice: product.compareAtPrice, stock: product.stock, isFeatured: product.isFeatured }
      : {},
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploading(true);
    for (const file of files) {
      const reader = new FileReader();
      await new Promise<void>((resolve) => {
        reader.onload = async () => {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file: reader.result, folder: "lumiere/products" }),
          });
          const data = await res.json();
          if (data.url) setImages((prev) => [...prev, { url: data.url, publicId: data.publicId }]);
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
    setUploading(false);
    toast.success("Images uploaded");
  };

  const addVariant = () => setVariants((v) => [...v, { name: "", sku: "", price: 0, stock: 0 }]);
  const updateVariant = (i: number, key: string, val: any) => setVariants((v) => v.map((x, idx) => (idx === i ? { ...x, [key]: val } : x)));

  const onSubmit = (data: any) => {
    if (images.length === 0) return toast.error("Add at least one image");
    startTransition(async () => {
      const payload = {
        ...data,
        images, variants, skinType,
        discount: data.compareAtPrice ? Math.round(((data.compareAtPrice - data.price) / data.compareAtPrice) * 100) : 0,
      };
      const saved = product ? await updateProduct(product._id, payload) : await createProduct(payload);
      toast.success(product ? "Product updated" : "Product created");
      onSaved(saved);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4 overflow-auto">
      <div className="bg-white dark:bg-stone-900 rounded-2xl w-full max-w-3xl my-8 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800 sticky top-0 bg-white dark:bg-stone-900 z-10">
          <h2 className="font-serif text-2xl">{product ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Images */}
          <div>
            <label className="text-sm font-medium mb-2 block">Product Images</label>
            <div className="flex flex-wrap gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative h-24 w-24 rounded-xl overflow-hidden group">
                  <img src={img.url} className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setImages((p) => p.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
              <label className="h-24 w-24 rounded-xl border-2 border-dashed border-stone-300 grid place-items-center cursor-pointer hover:border-sage-400">
                <Upload className="h-5 w-5 text-stone-400" />
                <input type="file" accept="image/*" multiple hidden onChange={handleUpload} />
              </label>
            </div>
            {uploading && <p className="text-xs text-sage-600 mt-2">Uploading...</p>}
          </div>

          <Input label="Name" {...register("name")} error={errors.name} />
          <Textarea label="Description" {...register("description")} error={errors.description} />

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <select {...register("category")} className="w-full h-11 px-4 rounded-xl bg-cream-100 dark:bg-stone-800 outline-none text-sm">
                <option value="">Select...</option>
                {categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              {errors.category && <p className="text-xs text-red-500">{errors.category.message as string}</p>}
            </div>
            <Input label="Stock" type="number" {...register("stock")} error={errors.stock} />
            <Input label="Price ($)" type="number" step="0.01" {...register("price")} error={errors.price} />
            <Input label="Compare At Price ($)" type="number" step="0.01" {...register("compareAtPrice")} />
          </div>

          {/* Skin Type */}
          <div>
            <label className="text-sm font-medium mb-2 block">Skin Types</label>
            <div className="flex flex-wrap gap-2">
              {SKIN_TYPES.map((t) => (
                <button type="button" key={t} onClick={() => setSkinType((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t])}
                  className={`text-xs px-3 py-1.5 rounded-full border ${skinType.includes(t) ? "bg-sage-600 text-white border-sage-600" : "border-stone-200 text-stone-600"}`}>{t}</button>
              ))}
            </div>
          </div>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Variants (optional)</label>
              <Button type="button" variant="ghost" size="sm" onClick={addVariant}><Plus className="h-4 w-4" /> Add</Button>
            </div>
            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                <input placeholder="Name (50ml)" value={v.name} onChange={(e) => updateVariant(i, "name", e.target.value)} className="h-10 px-3 rounded-lg bg-cream-100 dark:bg-stone-800 text-sm outline-none" />
                <input placeholder="SKU" value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} className="h-10 px-3 rounded-lg bg-cream-100 dark:bg-stone-800 text-sm outline-none" />
                <input placeholder="Price" type="number" value={v.price} onChange={(e) => updateVariant(i, "price", +e.target.value)} className="h-10 px-3 rounded-lg bg-cream-100 dark:bg-stone-800 text-sm outline-none" />
                <input placeholder="Stock" type="number" value={v.stock} onChange={(e) => updateVariant(i, "stock", +e.target.value)} className="h-10 px-3 rounded-lg bg-cream-100 dark:bg-stone-800 text-sm outline-none" />
              </div>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("isFeatured")} className="rounded" /> Featured product
          </label>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={pending || uploading}>{pending ? "Saving..." : "Save Product"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const Input = ({ label, error, ...props }: any) => (
  <div>
    <label className="text-sm font-medium mb-1 block">{label}</label>
    <input {...props} className="w-full h-11 px-4 rounded-xl bg-cream-100 dark:bg-stone-800 outline-none focus:ring-2 ring-sage-400 text-sm" />
    {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
  </div>
);
const Textarea = ({ label, error, ...props }: any) => (
  <div>
    <label className="text-sm font-medium mb-1 block">{label}</label>
    <textarea rows={3} {...props} className="w-full px-4 py-3 rounded-xl bg-cream-100 dark:bg-stone-800 outline-none focus:ring-2 ring-sage-400 text-sm" />
    {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
  </div>
);
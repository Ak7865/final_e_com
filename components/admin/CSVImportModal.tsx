"use client";
import { useState } from "react";
import { X, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CSVImportModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const text = await file.text();
    const res = await fetch("/api/products/csv", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv: text }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.error) return toast.error(data.error);
    toast.success(`Imported: ${data.inserted} new, ${data.updated} updated`);
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl">Import Products CSV</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <label className="border-2 border-dashed border-stone-300 rounded-2xl p-10 grid place-items-center cursor-pointer hover:border-sage-400">
          <Upload className="h-8 w-8 text-stone-400 mb-2" />
          <span className="text-sm text-stone-500">{loading ? "Importing..." : "Click to select a CSV file"}</span>
          <input type="file" accept=".csv" hidden onChange={handleFile} disabled={loading} />
        </label>
        <p className="text-xs text-stone-400 mt-3">Columns: name, price, compareAtPrice, stock, sku, category, description, isFeatured</p>
      </div>
    </div>
  );
}
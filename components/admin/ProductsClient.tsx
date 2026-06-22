"use client";
import { useState, useTransition } from "react";
import { Plus, Search, Edit, Trash2, Download, Upload, FileDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductFormModal } from "./ProductFormModal";
import { CSVImportModal } from "./CSVImportModal";
import { deleteProduct } from "@/actions/product";
import { formatPrice } from "@/lib/utils";

export function ProductsClient({ initialProducts, categories }: { initialProducts: any[]; categories: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [editProduct, setEditProduct] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [pending, startTransition] = useTransition();

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || p.category?._id === filterCat;
    return matchSearch && matchCat;
  });

  const handleDelete = (id: string) => {
    if (!confirm("Delete this product?")) return;
    startTransition(async () => {
      const res = await deleteProduct(id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        toast.success("Product deleted");
      }
    });
  };

  const exportCSV = () => window.open("/api/products/csv", "_blank");

  const downloadSample = () => {
    const sample = "name,price,compareAtPrice,stock,sku,category,description,isFeatured\nVitamin C Serum,68,85,50,VIT-001,Serums,Brightening serum,true";
    const blob = new Blob([sample], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "sample-products.csv"; a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl">Products</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={downloadSample}><FileDown className="h-4 w-4" /> Sample CSV</Button>
          <Button variant="outline" size="sm" onClick={() => setShowImport(true)}><Upload className="h-4 w-4" /> Import</Button>
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4" /> Export</Button>
          <Button size="sm" onClick={() => { setEditProduct(null); setShowForm(true); }}><Plus className="h-4 w-4" /> Add Product</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center bg-white dark:bg-stone-900 rounded-full px-4 h-11 flex-1 min-w-[240px] shadow-sm">
          <Search className="h-4 w-4 text-stone-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or SKU..." className="bg-transparent px-3 outline-none text-sm w-full" />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="bg-white dark:bg-stone-900 rounded-full px-4 h-11 text-sm shadow-sm outline-none">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-100 dark:bg-stone-800 text-stone-500">
              <tr>
                <th className="text-left p-4">Product</th>
                <th className="text-left p-4">SKU</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Price</th>
                <th className="text-left p-4">Stock</th>
                <th className="text-left p-4">Status</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id} className="border-t border-stone-100 dark:border-stone-800">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-cover bg-center bg-cream-100" style={{ backgroundImage: `url(${p.images?.[0]?.url})` }} />
                      <span className="font-medium line-clamp-1 max-w-[180px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-stone-500">{p.sku}</td>
                  <td className="p-4 text-stone-500">{p.category?.name}</td>
                  <td className="p-4">{formatPrice(p.price)}</td>
                  <td className="p-4">
                    <span className={p.stock <= p.lowStockThreshold ? "text-red-500 font-medium" : ""}>{p.stock}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.isActive ? "bg-green-50 text-green-600" : "bg-stone-100 text-stone-500"}`}>{p.isActive ? "Active" : "Inactive"}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => { setEditProduct(p); setShowForm(true); }} className="p-2 hover:bg-sage-50 rounded-lg"><Edit className="h-4 w-4 text-sage-600" /></button>
                    <button onClick={() => handleDelete(p._id)} disabled={pending} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4 text-red-500" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <ProductFormModal
          product={editProduct} categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={(saved: any) => {
            setProducts((prev) => {
              const exists = prev.find((p) => p._id === saved._id);
              return exists ? prev.map((p) => (p._id === saved._id ? saved : p)) : [saved, ...prev];
            });
            setShowForm(false);
          }}
        />
      )}
      {showImport && <CSVImportModal onClose={() => setShowImport(false)} onDone={() => location.reload()} />}
    </div>
  );
}

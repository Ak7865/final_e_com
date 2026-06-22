"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

export function SearchBar() {
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const debounced = useDebounce(q, 350);
  const router = useRouter();

  useEffect(() => {
    if (debounced.length < 2) return setSuggestions([]);
    fetch(`/api/products?q=${debounced}&limit=5`).then((r) => r.json()).then((d) => setSuggestions(d.products || []));
  }, [debounced]);

  return (
    <div className="relative w-full max-w-md">
      <div className="flex items-center bg-cream-100 dark:bg-stone-800 rounded-full px-4 h-11">
        <Search className="h-4 w-4 text-stone-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && router.push(`/products?q=${q}`)}
          placeholder="Search skincare..." className="bg-transparent flex-1 px-3 outline-none text-sm" />
      </div>
      {suggestions.length > 0 && (
        <ul className="absolute top-12 left-0 right-0 bg-white dark:bg-stone-900 rounded-2xl shadow-xl overflow-hidden z-50">
          {suggestions.map((s) => (
            <li key={s._id} onClick={() => router.push(`/products/${s.slug}`)} className="px-4 py-3 hover:bg-sage-50 cursor-pointer text-sm">{s.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
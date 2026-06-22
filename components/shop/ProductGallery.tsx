"use client";
import { useState } from "react";
import Image from "next/image";

interface ImageItem {
  url: string;
  publicId?: string;
}

export function ProductGallery({ images }: { images: ImageItem[] }) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] bg-cream-100 dark:bg-stone-900 rounded-2xl flex items-center justify-center text-stone-400">
        No Image Available
      </div>
    );
  }

  const activeImage = images[activeIdx]?.url || "/placeholder.png";

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-cream-100 dark:bg-stone-900">
        <Image
          src={activeImage}
          alt="Product image"
          fill
          priority
          className="object-cover"
          sizes="(max-w-768px) 100vw, 50vw"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`relative aspect-[3/4] w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 bg-cream-50 ${
                activeIdx === idx
                  ? "border-sage-500"
                  : "border-transparent opacity-75 hover:opacity-100"
              } transition`}
            >
              <Image
                src={img.url}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

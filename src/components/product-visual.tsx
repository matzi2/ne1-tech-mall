"use client";

import type { CatalogProduct } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  distribution: "from-slate-800 to-sky-700",
  control: "from-sky-800 to-cyan-600",
  switch: "from-amber-700 to-orange-500",
  component: "from-slate-700 to-slate-500",
};

export function ProductVisual({
  product,
  className,
}: {
  product: CatalogProduct;
  className?: string;
}) {
  const photo = product.photos[0];
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo.dataUrl}
        alt={product.name}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-end overflow-hidden bg-gradient-to-br p-4 text-white",
        tones[product.category],
        className,
      )}
    >
      <div className="absolute inset-4 rounded border border-white/20" />
      <div className="absolute right-6 top-6 h-10 w-10 rounded-full border-2 border-white/40" />
      <div>
        <p className="text-[11px] tracking-[0.2em] text-white/70">{product.sku}</p>
        <p className="mt-1 text-sm font-semibold leading-snug">{product.name}</p>
      </div>
    </div>
  );
}

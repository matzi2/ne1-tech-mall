"use client";

import type { CatalogProduct } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  ic: "from-zinc-800 to-sky-600",
  discrete: "from-slate-800 to-indigo-600",
  sensor: "from-teal-800 to-emerald-500",
  passive: "from-stone-700 to-amber-600",
  mcu: "from-blue-900 to-sky-500",
  led: "from-red-800 to-rose-500",
  lcd: "from-cyan-900 to-sky-500",
  breaker: "from-slate-800 to-sky-700",
  elcb: "from-sky-800 to-cyan-600",
  contactor: "from-indigo-800 to-blue-600",
  power: "from-emerald-800 to-teal-600",
  battery: "from-lime-800 to-green-500",
  connector: "from-neutral-700 to-orange-500",
  terminal: "from-slate-700 to-slate-500",
  pcb: "from-green-900 to-lime-600",
  switch: "from-orange-800 to-amber-500",
  surge: "from-amber-700 to-orange-500",
  relay: "from-violet-800 to-purple-600",
  fuse: "from-rose-800 to-red-600",
  motor: "from-blue-800 to-indigo-500",
  cable: "from-yellow-800 to-red-500",
  tool: "from-stone-800 to-zinc-500",
  meter: "from-yellow-700 to-amber-400",
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

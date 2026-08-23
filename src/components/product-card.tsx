"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useCompare } from "@/components/compare-provider";
import { ProductVisual } from "@/components/product-visual";
import type { CatalogProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { getCategoryGroup, getCategoryLabel } from "@/lib/products";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const compare = useCompare();
  const group = getCategoryGroup(product.category);
  const on = compare.has(product.slug);

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md">
      <label className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded bg-white/95 px-2 py-1 text-[11px] font-medium text-slate-700 shadow-sm">
        <input type="checkbox" checked={on} onChange={() => compare.toggle(product.slug)} />
        비교
      </label>
      <Link href={`/products/${product.slug}`} className="group block">
        <div className="aspect-[4/3] overflow-hidden bg-slate-100">
          <ProductVisual product={product} />
        </div>
        <div className="space-y-2 p-4">
          <div className="flex flex-wrap items-center gap-2">
            {group ? <Badge variant="muted">{group.label}</Badge> : null}
            <Badge variant="outline">{getCategoryLabel(product.category)}</Badge>
            {product.source !== "seed" ? <Badge>신규등록</Badge> : null}
          </div>
          <h3 className="line-clamp-2 text-base font-semibold text-navy group-hover:text-sky-700">{product.name}</h3>
          <p className="line-clamp-2 text-sm text-slate-500">{product.summary}</p>
          <p className="pt-1 text-lg font-bold text-navy">{formatPrice(product.price)}</p>
        </div>
      </Link>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProductVisual } from "@/components/product-visual";
import type { CatalogProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { getCategoryLabel } from "@/lib/products";

export function ProductCard({ product }: { product: CatalogProduct }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden bg-slate-100">
        <ProductVisual product={product} />
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{getCategoryLabel(product.category)}</Badge>
          {product.source !== "seed" ? <Badge>신규등록</Badge> : null}
        </div>
        <h3 className="line-clamp-2 text-base font-semibold text-navy group-hover:text-sky-700">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-sm text-slate-500">{product.summary}</p>
        <p className="pt-1 text-lg font-bold text-navy">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}

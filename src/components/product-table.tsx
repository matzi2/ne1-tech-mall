"use client";

import Link from "next/link";
import { useApp } from "@/components/app-providers";
import { useBom } from "@/components/bom-provider";
import { useCompare } from "@/components/compare-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CatalogProduct } from "@/lib/catalog";
import { stockLabel } from "@/lib/compare";
import { formatPrice } from "@/lib/format";
import { getCategoryGroup, getCategoryLabel } from "@/lib/products";

export function ProductTable({ products }: { products: CatalogProduct[] }) {
  const { addToCart } = useApp();
  const bom = useBom();
  const compare = useCompare();

  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-[860px] w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs text-slate-500">
          <tr>
            <th className="px-3 py-3 font-medium">품번</th>
            <th className="px-3 py-3 font-medium">제품명</th>
            <th className="px-3 py-3 font-medium">분류</th>
            <th className="px-3 py-3 font-medium">가격</th>
            <th className="px-3 py-3 font-medium">재고</th>
            <th className="px-3 py-3 font-medium">비교</th>
            <th className="px-3 py-3 font-medium">작업</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const group = getCategoryGroup(product.category);
            return (
              <tr key={product.slug} className="border-t border-slate-100 align-top">
                <td className="px-3 py-3 font-mono text-xs text-slate-600">{product.sku}</td>
                <td className="px-3 py-3">
                  <Link href={`/products/${product.slug}`} className="font-semibold text-navy hover:underline">
                    {product.name}
                  </Link>
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{product.summary}</p>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-col gap-1">
                    {group ? <Badge variant="muted">{group.label}</Badge> : null}
                    <Badge variant="outline">{getCategoryLabel(product.category)}</Badge>
                  </div>
                </td>
                <td className="px-3 py-3 font-semibold text-navy">{formatPrice(product.price)}</td>
                <td className="px-3 py-3 text-slate-600">
                  {stockLabel(product.stock)}
                  <span className="block text-xs text-slate-400">{product.leadTime}</span>
                </td>
                <td className="px-3 py-3">
                  <label className="inline-flex items-center gap-1 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={compare.has(product.slug)}
                      onChange={() => compare.toggle(product.slug)}
                    />
                    비교
                  </label>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="outline" onClick={() => bom.add(product.slug, 1)}>
                      {bom.has(product.slug) ? `BOM ${bom.qtyOf(product.slug)}` : "BOM"}
                    </Button>
                    <Button size="sm" onClick={() => addToCart(product.slug, 1)}>
                      담기
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

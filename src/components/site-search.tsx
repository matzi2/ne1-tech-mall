"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useApp } from "@/components/app-providers";
import { filterCatalog } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function SiteSearch({
  compact = false,
  initialQuery = "",
  className,
}: {
  compact?: boolean;
  initialQuery?: string;
  className?: string;
}) {
  const router = useRouter();
  const { catalog } = useApp();
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(
    () => (query.trim().length >= 1 ? filterCatalog(catalog, query).slice(0, 6) : []),
    [catalog, query],
  );

  function go(value = query) {
    const q = value.trim();
    setOpen(false);
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  }

  return (
    <div className={cn("relative", className)}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          go();
        }}
        className={cn(
          "flex items-center rounded-md border bg-white text-slate-900",
          compact ? "h-9" : "h-11",
        )}
      >
        <Search className="ml-3 size-4 shrink-0 text-slate-400" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          placeholder="품번, 제품명, 사양으로 검색"
          className="h-full w-full bg-transparent px-2 text-sm outline-none placeholder:text-slate-400"
          aria-label="상품 검색"
        />
        <button
          type="submit"
          className="h-full rounded-r-md bg-sky-600 px-3 text-sm font-semibold text-white hover:bg-sky-700"
        >
          검색
        </button>
      </form>
      {open && query.trim() ? (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
          {suggestions.length === 0 ? (
            <p className="px-3 py-3 text-sm text-slate-500">
              “{query}”에 맞는 상품이 없습니다.
            </p>
          ) : (
            <ul>
              {suggestions.map((item) => (
                <li key={item.slug}>
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-slate-50"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => router.push(`/products/${item.slug}`)}
                  >
                    <span>
                      <span className="block font-medium text-navy">{item.name}</span>
                      <span className="text-xs text-slate-500">{item.sku}</span>
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-sky-700">
                      {formatPrice(item.price)}
                    </span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className="w-full border-t px-3 py-2 text-left text-sm font-medium text-sky-700 hover:bg-sky-50"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => go()}
                >
                  “{query}” 전체 검색 결과 보기
                </button>
              </li>
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

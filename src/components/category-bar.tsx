"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { categories } from "@/lib/products";
import { cn } from "@/lib/utils";

function CategoryBarInner() {
  const pathname = usePathname();
  const params = useSearchParams();
  const current = pathname === "/products" ? (params.get("category") ?? "all") : "";

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2">
        {categories.map((item) => (
          <Link
            key={item.id}
            href={item.id === "all" ? "/products" : `/products?category=${item.id}`}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-sm",
              current === item.id || (item.id === "all" && pathname === "/products" && !params.get("category"))
                ? "bg-navy text-white"
                : "text-slate-700 hover:bg-slate-100",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function CategoryBar() {
  return (
    <Suspense fallback={<div className="h-11 border-b border-slate-200 bg-white" />}>
      <CategoryBarInner />
    </Suspense>
  );
}

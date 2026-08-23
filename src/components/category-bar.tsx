"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { categoryGroups, categoriesInGroup, type CategoryGroupId } from "@/lib/products";
import { cn } from "@/lib/utils";

function CategoryBarInner() {
  const pathname = usePathname();
  const params = useSearchParams();
  const groupParam = (params.get("group") as CategoryGroupId | null) ?? null;
  const leaf = pathname === "/products" || pathname === "/compare" ? (params.get("category") ?? "") : "";
  const [hover, setHover] = useState<CategoryGroupId | "all" | null>(groupParam);
  const activeGroup = hover ?? groupParam ?? "all";
  const children = activeGroup === "all" ? [] : categoriesInGroup(activeGroup);

  function hrefForGroup(id: CategoryGroupId | "all") {
    if (pathname === "/compare") {
      return id === "all" ? "/compare" : `/compare?category=${categoriesInGroup(id)[0]?.id ?? ""}`;
    }
    return id === "all" ? "/products" : `/products?group=${id}`;
  }

  function hrefForLeaf(id: string) {
    if (pathname === "/compare") return `/compare?category=${id}`;
    const group = groupParam ? `&group=${groupParam}` : "";
    return `/products?category=${id}${group}`;
  }

  return (
    <div className="border-b border-slate-200 bg-white" onMouseLeave={() => setHover(groupParam)}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex gap-1 overflow-x-auto py-2">
          <Link
            href={hrefForGroup("all")}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-sm",
              !groupParam && !leaf ? "bg-navy text-white" : "text-slate-700 hover:bg-slate-100",
            )}
            onMouseEnter={() => setHover("all")}
          >
            전체
          </Link>
          {categoryGroups.map((item) => (
            <Link
              key={item.id}
              href={hrefForGroup(item.id)}
              onMouseEnter={() => setHover(item.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-sm",
                groupParam === item.id || hover === item.id
                  ? "bg-navy text-white"
                  : "text-slate-700 hover:bg-slate-100",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
        {children.length ? (
          <div className="flex gap-2 overflow-x-auto border-t border-slate-100 py-2">
            {children.map((item) => (
              <Link
                key={item.id}
                href={hrefForLeaf(item.id)}
                className={cn(
                  "shrink-0 text-sm",
                  leaf === item.id ? "font-semibold text-[#0046CA]" : "text-slate-600 hover:text-navy",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function CategoryBar() {
  return (
    <Suspense fallback={<div className="h-16 border-b border-slate-200 bg-white" />}>
      <CategoryBarInner />
    </Suspense>
  );
}

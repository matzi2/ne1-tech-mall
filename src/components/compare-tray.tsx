"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/components/app-providers";
import { useCompare } from "@/components/compare-provider";
import { Button } from "@/components/ui/button";

export function CompareTray() {
  const pathname = usePathname();
  const { catalog } = useApp();
  const compare = useCompare();

  if (
    pathname.startsWith("/connect") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/find-account") ||
    pathname === "/compare"
  ) {
    return null;
  }

  if (compare.slugs.length === 0) return null;

  const names = compare.slugs
    .map((slug) => catalog.find((item) => item.slug === slug)?.name)
    .filter(Boolean);

  return (
    <div className="sticky bottom-0 z-40 border-t border-amber-300 bg-amber-50">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="text-sm text-navy">
          <span className="font-semibold">비교 {compare.slugs.length}개</span>
          <span className="ml-2 text-slate-600">{names.join(" · ")}</span>
        </p>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={compare.clear}>
            비우기
          </Button>
          <Button asChild size="sm" variant="navy">
            <Link href={`/compare?slugs=${compare.slugs.join(",")}`}>비교하기</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

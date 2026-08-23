"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/components/app-providers";
import { isAdmin } from "@/lib/company";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "운영화면" },
  { href: "/admin/products/new", label: "상품등록" },
  { href: "/products", label: "쇼핑몰" },
  { href: "/history", label: "히스토리" },
  { href: "/connect/nas", label: "시놀로지" },
];

export function AdminBar() {
  const pathname = usePathname();
  const { user } = useApp();

  if (!isAdmin(user)) return null;

  return (
    <div className="sticky top-0 z-50 border-b border-amber-300 bg-amber-400 text-navy">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <p className="text-sm font-semibold">
          운영 · {user?.name} · {user?.email}
        </p>
        <nav className="flex flex-wrap items-center gap-3 text-sm font-medium">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "underline-offset-4 hover:underline",
                pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                  ? "underline"
                  : "",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

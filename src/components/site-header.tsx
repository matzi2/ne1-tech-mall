"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingCart, UserRound } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/components/app-providers";
import { Ne1Logo } from "@/components/ne1-logo";
import { SiteSearch } from "@/components/site-search";
import { Button } from "@/components/ui/button";
import { company } from "@/lib/company";
import { formatPoints } from "@/lib/points";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/connect", label: "사이트 연결" },
  { href: "/company", label: "회사소개" },
  { href: "/products", label: "제품몰" },
  { href: "/inquiry", label: "견적·문의" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, cartCount, pointBalance } = useApp();
  const [open, setOpen] = useState(false);
  const isAuth =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/find-account") ||
    pathname.startsWith("/oauth2");

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy text-white">
      <div className="hidden border-b border-white/10 text-xs text-white/70 md:block">
        <div className="mx-auto flex h-9 max-w-6xl items-center justify-between px-4">
          <p>
            {company.domain} · {company.hours}
          </p>
          <p>
            {company.phone} · {company.phone2} · {company.email}
          </p>
        </div>
      </div>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2">
          <Ne1Logo />
        </Link>
        <SiteSearch compact className="hidden max-w-md flex-1 md:block" />
        <nav className="hidden items-center gap-5 text-sm md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "hover:text-sky-300",
                pathname.startsWith(item.href) && "text-sky-300",
              )}
            >
              {item.label}
            </Link>
          ))}
          {user?.role === "admin" ? (
            <Link
              href="/admin/products/new"
              className={cn("hover:text-amber-300", pathname.startsWith("/admin") && "text-amber-300")}
            >
              상품등록
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Link
              href="/mypage"
              className="hidden items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-xs md:flex"
            >
              <UserRound className="size-3.5" />
              {user.name}
              <span className="rounded bg-amber-400 px-1.5 py-0.5 font-semibold text-navy">
                {formatPoints(pointBalance)}
              </span>
            </Link>
          ) : (
            <Button asChild variant="amber" size="sm" className={cn(isAuth && "ring-2 ring-amber-200")}>
              <Link href="/login">로그인</Link>
            </Button>
          )}
          <Button asChild variant="secondary" size="icon" className="relative bg-white/10 text-white hover:bg-white/20">
            <Link href="/cart" aria-label="장바구니">
              <ShoppingCart className="size-4" />
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-navy">
                  {cartCount}
                </span>
              ) : null}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>
      {open ? (
        <div className="space-y-3 border-t border-white/10 px-4 py-3 md:hidden">
          <SiteSearch compact />
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="block py-1" onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href={user ? "/mypage" : "/login"} onClick={() => setOpen(false)} className="block py-1">
            {user ? "마이페이지" : "로그인"}
          </Link>
        </div>
      ) : null}
    </header>
  );
}

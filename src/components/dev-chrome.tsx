"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/components/app-providers";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/connect", label: "작업 목록", exact: true },
  { href: "/connect/nas", label: "시놀로지" },
  { href: "/connect/domain", label: "가비아 DNS" },
  { href: "/connect/gabia", label: "가비아 로그인" },
  { href: "/connect/github", label: "GitHub" },
];

export function DevChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useApp();

  return (
    <div className="flex min-h-full flex-col bg-zinc-100 text-zinc-900">
      <header className="border-b border-zinc-800 bg-zinc-900 text-zinc-100">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Dev workbench</p>
            <h1 className="text-base font-bold">엔이원텍 개발 작업실</h1>
          </div>
          <p className="text-xs text-zinc-400">{user?.email ?? "관리자 로그인 필요"}</p>
        </div>
        <nav className="mx-auto flex max-w-5xl flex-wrap gap-1 px-4 pb-3">
          {tabs.map((tab) => {
            const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm",
                  active ? "bg-white text-zinc-900" : "text-zinc-300 hover:bg-zinc-800 hover:text-white",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-zinc-200 px-4 py-3 text-center text-xs text-zinc-500">
        이 주소는 개발 작업실입니다. 쇼핑몰 화면과는 헤더·푸터를 공유하지 않습니다.
      </footer>
    </div>
  );
}

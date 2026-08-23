"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { AdminBar } from "@/components/admin-bar";
import { SiteFooter } from "@/components/site-footer";
import { CategoryBar } from "@/components/category-bar";
import { CompareTray } from "@/components/compare-tray";
import { SiteHeader } from "@/components/site-header";

function hideCategoryBar(pathname: string) {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/history") ||
    pathname.startsWith("/connect") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/find-account") ||
    pathname.startsWith("/oauth2") ||
    pathname.startsWith("/redirect")
  );
}

function ChromeInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith("/connect")) {
    return <>{children}</>;
  }

  return (
    <>
      <AdminBar />
      <SiteHeader />
      {hideCategoryBar(pathname) ? null : <CategoryBar />}
      <main className="flex-1">{children}</main>
      <CompareTray />
      <SiteFooter />
    </>
  );
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white">
          <div className="h-16 bg-navy" />
          <div>{children}</div>
        </div>
      }
    >
      <ChromeInner>{children}</ChromeInner>
    </Suspense>
  );
}

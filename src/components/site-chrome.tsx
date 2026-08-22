"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

function isWorkSurface(pathname: string, popup: boolean) {
  if (popup) return true;
  if (pathname.startsWith("/oauth2")) return true;
  if (pathname.startsWith("/redirect")) return true;
  return false;
}

function ChromeInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const popup = params.get("popup") === "1";
  const work = isWorkSurface(pathname, popup);

  if (work) {
    return <div className="min-h-full bg-[#f5f6f8]">{children}</div>;
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </>
      }
    >
      <ChromeInner>{children}</ChromeInner>
    </Suspense>
  );
}

"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { InAppBrowser } from "@/components/in-app-browser";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isWorkSurface } from "@/lib/in-app-browser";

function ChromeInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isWorkSurface(pathname)) {
    return <InAppBrowser>{children}</InAppBrowser>;
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
        <div className="min-h-screen bg-[#e8eaed]">
          <div className="h-24 border-b border-[#c4c7cc] bg-[#e8eaed]" />
          <div className="bg-[#f5f6f8]">{children}</div>
        </div>
      }
    >
      <ChromeInner>{children}</ChromeInner>
    </Suspense>
  );
}

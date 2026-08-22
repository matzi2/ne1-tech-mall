"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, RotateCw, Plus, MoreVertical, Lock } from "lucide-react";
import { WORK_TABS, workAddress } from "@/lib/in-app-browser";

export function InAppBrowser({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const search = searchParams.toString();
  const address = workAddress(pathname, search ? `?${search}` : "");
  const activeTab = WORK_TABS.find((tab) => tab.match(pathname));

  return (
    <div className="flex min-h-screen flex-col bg-[#202124]">
      <header className="shrink-0 bg-[#dee1e6]">
        <div className="flex items-end gap-1 px-2 pt-2">
          <div className="mb-2 flex items-center gap-1.5 px-1" aria-hidden>
            <span className="size-3 rounded-full bg-[#ff5f57]" />
            <span className="size-3 rounded-full bg-[#febc2e]" />
            <span className="size-3 rounded-full bg-[#28c840]" />
          </div>
          <nav className="flex min-w-0 flex-1 items-end overflow-x-auto" aria-label="Chrome 탭">
            {WORK_TABS.map((tab) => {
              const active = tab.match(pathname);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`relative mr-px flex h-9 max-w-[180px] shrink-0 items-center rounded-t-lg px-3 text-sm ${
                    active
                      ? "z-10 bg-[#f1f3f4] font-medium text-[#202124]"
                      : "bg-[#d3d6db] text-[#3c4043] hover:bg-[#c8cbd0]"
                  }`}
                >
                  <span className="truncate">{tab.label}</span>
                </Link>
              );
            })}
            <Link
              href="/connect/github"
              className="mb-1 ml-1 flex size-7 items-center justify-center rounded-full text-[#3c4043] hover:bg-black/10"
              aria-label="새 탭"
            >
              <Plus className="size-4" />
            </Link>
          </nav>
          <p className="mb-2 hidden shrink-0 px-2 text-xs text-[#5f6368] sm:block">Chrome · 보이는 작업창</p>
        </div>

        <div className="flex items-center gap-2 bg-[#f1f3f4] px-3 py-2">
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full text-[#3c4043] hover:bg-black/5"
            onClick={() => router.back()}
            aria-label="뒤로"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full text-[#3c4043] hover:bg-black/5"
            onClick={() => router.forward()}
            aria-label="앞으로"
          >
            <ArrowRight className="size-4" />
          </button>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full text-[#3c4043] hover:bg-black/5"
            onClick={() => router.refresh()}
            aria-label="새로고침"
          >
            <RotateCw className="size-4" />
          </button>
          <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-full bg-white px-3 text-sm text-[#3c4043] shadow-sm">
            <Lock className="size-3.5 shrink-0 text-[#5f6368]" />
            <span className="truncate font-sans">{address}</span>
          </div>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full text-[#3c4043]"
            aria-label="Chrome 메뉴"
          >
            <MoreVertical className="size-4" />
          </button>
        </div>
        <p className="bg-[#f1f3f4] px-4 pb-2 text-xs text-[#5f6368]">
          {activeTab?.label ?? "작업"} · 이 Chrome 창이 작업창입니다. 숨은 브라우저는 쓰지 않습니다.
        </p>
      </header>

      <main className="min-h-0 flex-1 overflow-auto bg-white">{children}</main>
    </div>
  );
}

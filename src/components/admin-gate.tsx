"use client";

import Link from "next/link";
import { useApp } from "@/components/app-providers";
import { Button } from "@/components/ui/button";
import { ADMIN_EMAIL, isAdmin } from "@/lib/company";

export function AdminGate({ children, next = "/admin" }: { children: React.ReactNode; next?: string }) {
  const { user, ready } = useApp();

  if (!ready) {
    return <p className="p-10 text-sm text-slate-500">화면을 준비하는 중입니다.</p>;
  }

  if (!isAdmin(user)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-navy">이 화면은 운영용입니다.</h1>
        <p className="mt-2 text-sm text-slate-500">관리자({ADMIN_EMAIL})로 로그인한 뒤에만 엽니다.</p>
        <Button asChild className="mt-6">
          <Link href={`/login?next=${encodeURIComponent(next)}&email=${encodeURIComponent(ADMIN_EMAIL)}`}>로그인</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

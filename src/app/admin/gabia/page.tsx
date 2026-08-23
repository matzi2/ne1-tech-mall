import { Suspense } from "react";
import { GabiaDesk } from "@/components/gabia-desk";

export const dynamic = "force-dynamic";

export default function AdminGabiaPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-600">가비아 작업창을 여는 중…</p>}>
      <GabiaDesk />
    </Suspense>
  );
}

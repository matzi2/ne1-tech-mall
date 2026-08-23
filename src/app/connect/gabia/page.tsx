import { Suspense } from "react";
import { GabiaDesk } from "@/components/gabia-desk";

export const dynamic = "force-dynamic";

export default function GabiaWorkPage() {
  return (
    <Suspense fallback={<p className="p-4 text-sm text-slate-600">가비아 작업창을 여는 중…</p>}>
      <GabiaDesk />
    </Suspense>
  );
}

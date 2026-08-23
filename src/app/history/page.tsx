import Link from "next/link";
import { company } from "@/lib/company";
import { releases } from "@/lib/releases";

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm font-semibold tracking-wide text-[#0046CA]">RELEASE HISTORY</p>
      <h1 className="mt-1 text-3xl font-bold text-navy">버전 히스토리</h1>
      <p className="mt-2 text-sm text-slate-600">
        현재 배포 버전은 <strong>v{company.version}</strong> ({company.releasedAt}) 입니다. 배포할 때마다 여기에
        정리합니다.
      </p>
      <ol className="mt-8 space-y-6">
        {releases.map((release) => (
          <li key={release.version} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl font-bold text-navy">v{release.version}</h2>
              <p className="text-sm text-slate-500">{release.date}</p>
            </div>
            <p className="mt-1 font-medium text-slate-800">{release.title}</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
              {release.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm">
        <Link href="/" className="text-[#0046CA]">
          쇼핑몰
        </Link>
      </p>
    </div>
  );
}

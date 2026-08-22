import Link from "next/link";
import { company } from "@/lib/company";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-navy text-white/80">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-lg font-bold text-white">
            {company.nameEn} · {company.nameKo}
          </p>
          <p className="mt-2 max-w-md text-sm leading-6">{company.description}</p>
        </div>
        <div className="text-sm leading-7">
          <p className="font-semibold text-white">쇼핑몰</p>
          <Link href="/products" className="block hover:text-white">
            제품몰
          </Link>
          <Link href="/login" className="block hover:text-white">
            로그인
          </Link>
          <Link href="/inquiry" className="block hover:text-white">
            견적·문의
          </Link>
        </div>
        <div className="text-sm leading-7">
          <p className="font-semibold text-white">고객지원</p>
          <p>TEL {company.phone} · {company.phone2}</p>
          <p>FAX {company.fax}</p>
          <p>{company.email}</p>
          <p>{company.hours}</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl space-y-1 px-4 py-4 text-xs text-white/50">
          <p>
            {company.legalName} · 대표 {company.ceo} · {company.address}
          </p>
          <p>
            TEL {company.phone} · {company.phone2} · FAX {company.fax}
          </p>
          <p>
            입금계좌 {company.bank.name} {company.bank.account} (예금주 {company.bank.holder}) ·
            도메인 {company.domain} · v{company.version}
          </p>
        </div>
      </div>
    </footer>
  );
}

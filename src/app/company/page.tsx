import { company, companyHistory, capabilities } from "@/lib/company";

export default function CompanyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-sm font-semibold text-sky-700">{company.domain}</p>
      <h1 className="mt-2 text-3xl font-bold text-navy">
        {company.legalName}
      </h1>
      <p className="mt-4 leading-7 text-slate-600">{company.description}</p>
      <dl className="mt-8 grid gap-4 rounded-xl border border-slate-200 bg-white p-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">대표</dt>
          <dd className="font-medium">{company.ceo}</dd>
        </div>
        <div>
          <dt className="text-slate-500">설립</dt>
          <dd className="font-medium">{company.founded}</dd>
        </div>
        <div>
          <dt className="text-slate-500">업종</dt>
          <dd className="font-medium">{company.industry}</dd>
        </div>
        <div>
          <dt className="text-slate-500">전화</dt>
          <dd className="font-medium">
            {company.phone} · {company.phone2}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">팩스</dt>
          <dd className="font-medium">{company.fax}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-slate-500">주소</dt>
          <dd className="font-medium">{company.address}</dd>
        </div>
      </dl>
      <h2 className="mt-10 text-xl font-bold text-navy">사업 영역</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {capabilities.map((item) => (
          <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-10 text-xl font-bold text-navy">연혁</h2>
      <ol className="mt-4 space-y-4">
        {companyHistory.map((item) => (
          <li key={item.year} className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-sky-700">{item.year}</p>
            <p className="font-semibold text-navy">{item.title}</p>
            <p className="mt-1 text-sm text-slate-600">{item.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useApp } from "@/components/app-providers";
import { FileDropzone } from "@/components/file-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CATALOG_ACCEPT,
  DOCUMENT_ACCEPT,
  PHOTO_ACCEPT,
  fileToMedia,
  isCatalogFile,
  isDocumentFile,
  isPhotoFile,
  parseCatalogText,
  productFromDocument,
  productFromPhoto,
  type CatalogProduct,
} from "@/lib/catalog";
import { categories } from "@/lib/products";
import { slugify } from "@/lib/utils";
import { formatFileSize } from "@/lib/format";

type Method = "file" | "photo" | "document";

export default function AdminProductNewPage() {
  const router = useRouter();
  const { user, addProducts, ready } = useApp();
  const [method, setMethod] = useState<Method>("file");
  const [preview, setPreview] = useState<CatalogProduct[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [manual, setManual] = useState({
    sku: "",
    name: "",
    summary: "",
    description: "",
    category: "breaker",
    price: "",
  });

  const methods = useMemo(
    () =>
      [
        { id: "file" as const, title: "파일로 등록", hint: "CSV · TSV · JSON 카탈로그" },
        { id: "photo" as const, title: "사진으로 등록", hint: "JPG · PNG · WEBP 제품 사진" },
        { id: "document" as const, title: "문서로 등록", hint: "PDF · 도면 · 사양서 · 엑셀" },
      ],
    [],
  );

  async function onFiles(files: File[]) {
    setError("");
    setMessage("");
    try {
      const next: CatalogProduct[] = [];
      for (const file of files) {
        if (method === "file" || isCatalogFile(file)) {
          const text = await file.text();
          next.push(...parseCatalogText(text, file.name));
        } else if (method === "photo" || isPhotoFile(file)) {
          const media = await fileToMedia(file, "photo");
          next.push(productFromPhoto(file, media));
        } else if (method === "document" || isDocumentFile(file)) {
          const media = await fileToMedia(file, "document");
          next.push(productFromDocument(file, media));
        } else {
          throw new Error(`${file.name}은(는) 이 등록 방식에서 지원하지 않습니다.`);
        }
      }
      setPreview(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "파일을 읽지 못했습니다.");
    }
  }

  function register(items: CatalogProduct[]) {
    const result = addProducts(items);
    setMessage(`${result.added}건 등록, ${result.skipped}건은 품번/주소가 겹쳐 건너뛰었습니다.`);
    setPreview([]);
    if (result.added > 0) {
      router.push("/products");
    }
  }

  if (!ready) return <div className="p-10 text-sm text-slate-500">불러오는 중입니다.</div>;

  if (!user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-navy">관리자 로그인이 필요합니다.</h1>
        <p className="mt-2 text-slate-500">상품 등록은 관리자 계정으로만 할 수 있습니다.</p>
        <Button asChild className="mt-6">
          <Link href="/login?next=/admin/products/new&email=admin@ne1-tech.co.kr">로그인 화면 열기</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-navy">상품 등록</h1>
      <p className="mt-2 text-sm text-slate-500">
        카탈로그 파일, 제품 사진, 기술 문서 중 편한 방법으로 올리면 쇼핑몰에 바로 올라갑니다.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {methods.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setMethod(item.id);
              setPreview([]);
              setError("");
            }}
            className={`rounded-xl border p-4 text-left ${
              method === item.id ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-white"
            }`}
          >
            <p className="font-semibold text-navy">{item.title}</p>
            <p className="mt-1 text-xs text-slate-500">{item.hint}</p>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {method === "file" ? (
          <FileDropzone
            accept={CATALOG_ACCEPT}
            label="카탈로그 파일을 끌어다 놓거나 클릭해서 선택"
            hint="헤더 예시: sku,name,category,price,summary,description,leadTime,stock"
            onFiles={onFiles}
          />
        ) : null}
        {method === "photo" ? (
          <FileDropzone
            accept={PHOTO_ACCEPT}
            label="제품 사진을 올리세요"
            hint="파일명이 상품명으로 들어갑니다. 사진은 상품 상세 갤러리에 붙습니다."
            onFiles={onFiles}
          />
        ) : null}
        {method === "document" ? (
          <FileDropzone
            accept={DOCUMENT_ACCEPT}
            label="사양서·도면·매뉴얼을 올리세요"
            hint="PDF, DOC, HWP, XLSX, DWG 등을 지원합니다. 파일당 4MB 이하."
            onFiles={onFiles}
          />
        ) : null}
        <p className="mt-2 text-xs text-slate-500">
          양식이 필요하면{" "}
          <a href="/templates/ne1-tech-products.csv" className="text-sky-700 underline">
            CSV 템플릿
          </a>
          을 받아 작성하세요.
        </p>
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {message ? <p className="mt-4 text-sm text-sky-700">{message}</p> : null}

      {preview.length > 0 ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold">미리보기 {preview.length}건</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {preview.map((item) => (
              <li key={item.slug} className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-slate-500">
                  {item.sku} · 사진 {item.photos.length} · 문서 {item.documents.length}
                  {item.photos[0] ? ` · ${item.photos[0].name} (${formatFileSize(item.photos[0].size)})` : ""}
                  {item.documents[0] ? ` · ${item.documents[0].name}` : ""}
                </p>
              </li>
            ))}
          </ul>
          <Button className="mt-4" onClick={() => register(preview)}>
            이 상품 등록하기
          </Button>
        </div>
      ) : null}

      <form
        className="mt-10 space-y-4 rounded-xl border border-slate-200 bg-white p-5"
        onSubmit={(event) => {
          event.preventDefault();
          const sku = manual.sku || `NE1-MN-${Date.now().toString().slice(-6)}`;
          register([
            {
              slug: slugify(sku),
              sku,
              name: manual.name,
              summary: manual.summary || manual.name,
              description: manual.description || manual.summary || manual.name,
              category: (manual.category as CatalogProduct["category"]) || "breaker",
              price: manual.price ? Number(manual.price) : null,
              leadTime: "협의",
              stock: "in-stock",
              specs: [],
              photos: [],
              documents: [],
              source: "manual",
              createdAt: new Date().toISOString(),
            },
          ]);
        }}
      >
        <h2 className="font-semibold text-navy">직접 입력</h2>
        <div>
          <Label htmlFor="name">상품명</Label>
          <Input id="name" className="mt-1" value={manual.name} onChange={(e) => setManual({ ...manual, name: e.target.value })} required />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="sku">품번</Label>
            <Input id="sku" className="mt-1" value={manual.sku} onChange={(e) => setManual({ ...manual, sku: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="price">가격 (빈칸이면 견적)</Label>
            <Input id="price" className="mt-1" value={manual.price} onChange={(e) => setManual({ ...manual, price: e.target.value })} />
          </div>
        </div>
        <div>
          <Label htmlFor="category">카테고리</Label>
          <select
            id="category"
            className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            value={manual.category}
            onChange={(e) => setManual({ ...manual, category: e.target.value })}
          >
            {categories
              .filter((item) => item.id !== "all")
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
          </select>
        </div>
        <div>
          <Label htmlFor="summary">한줄 소개</Label>
          <Input id="summary" className="mt-1" value={manual.summary} onChange={(e) => setManual({ ...manual, summary: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="description">상세</Label>
          <Textarea id="description" className="mt-1" value={manual.description} onChange={(e) => setManual({ ...manual, description: e.target.value })} />
        </div>
        <Button type="submit" variant="navy">
          입력한 내용으로 등록
        </Button>
      </form>
    </div>
  );
}

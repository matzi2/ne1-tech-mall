"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BOM_STORAGE, parseBomLines, type BomLine } from "@/lib/bom";

type BomState = {
  lines: BomLine[];
  count: number;
  message: string;
  has: (slug: string) => boolean;
  qtyOf: (slug: string) => number;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  replace: (next: BomLine[]) => void;
  mergeSku: (sku: string, qty: number, slug?: string) => boolean;
  clear: () => void;
};

const BomContext = createContext<BomState | null>(null);

export function BomProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<BomLine[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setLines(parseBomLines(localStorage.getItem(BOM_STORAGE)));
  }, []);

  const persist = useCallback((next: BomLine[]) => {
    setLines(next);
    localStorage.setItem(BOM_STORAGE, JSON.stringify(next));
    return next;
  }, []);

  const value = useMemo<BomState>(
    () => ({
      lines,
      count: lines.reduce((sum, line) => sum + line.qty, 0),
      message,
      has: (slug) => lines.some((line) => line.slug === slug),
      qtyOf: (slug) => lines.find((line) => line.slug === slug)?.qty ?? 0,
      add: (slug, qty = 1) => {
        const amount = Math.max(1, Math.floor(qty) || 1);
        const existing = lines.find((line) => line.slug === slug);
        persist(
          existing
            ? lines.map((line) => (line.slug === slug ? { ...line, qty: line.qty + amount } : line))
            : [...lines, { slug, qty: amount }],
        );
        setMessage("BOM에 넣었습니다.");
      },
      setQty: (slug, qty) => {
        if (qty <= 0) persist(lines.filter((line) => line.slug !== slug));
        else persist(lines.map((line) => (line.slug === slug ? { ...line, qty } : line)));
        setMessage("");
      },
      remove: (slug) => {
        persist(lines.filter((line) => line.slug !== slug));
        setMessage("");
      },
      replace: (next) => {
        persist(next);
        setMessage("");
      },
      mergeSku: (sku, qty, slug) => {
        if (!slug) return false;
        const amount = Math.max(1, Math.floor(qty) || 1);
        const existing = lines.find((line) => line.slug === slug);
        persist(
          existing
            ? lines.map((line) => (line.slug === slug ? { ...line, qty: line.qty + amount } : line))
            : [...lines, { slug, qty: amount }],
        );
        setMessage(`${sku}를 BOM에 넣었습니다.`);
        return true;
      },
      clear: () => {
        persist([]);
        setMessage("");
      },
    }),
    [lines, message, persist],
  );

  return <BomContext.Provider value={value}>{children}</BomContext.Provider>;
}

export function useBom() {
  const ctx = useContext(BomContext);
  if (!ctx) throw new Error("useBom");
  return ctx;
}

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { COMPARE_MAX, COMPARE_STORAGE, parseCompareSlugs } from "@/lib/compare";

type CompareState = {
  slugs: string[];
  message: string;
  has: (slug: string) => boolean;
  toggle: (slug: string) => boolean;
  remove: (slug: string) => void;
  replace: (next: string[]) => void;
  clear: () => void;
};

const CompareContext = createContext<CompareState | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setSlugs(parseCompareSlugs(localStorage.getItem(COMPARE_STORAGE)));
  }, []);

  const persist = useCallback((next: string[]) => {
    const unique = [...new Set(next)].slice(0, COMPARE_MAX);
    setSlugs(unique);
    localStorage.setItem(COMPARE_STORAGE, unique.join(","));
    return unique;
  }, []);

  const value = useMemo<CompareState>(
    () => ({
      slugs,
      message,
      has: (slug) => slugs.includes(slug),
      toggle: (slug) => {
        if (slugs.includes(slug)) {
          persist(slugs.filter((item) => item !== slug));
          setMessage("");
          return false;
        }
        if (slugs.length >= COMPARE_MAX) {
          setMessage(`비교는 한 번에 ${COMPARE_MAX}개까지입니다. 하나를 뺀 뒤 넣어 주세요.`);
          return false;
        }
        persist([...slugs, slug]);
        setMessage("");
        return true;
      },
      remove: (slug) => {
        persist(slugs.filter((item) => item !== slug));
        setMessage("");
      },
      replace: (next) => {
        persist(next);
        setMessage("");
      },
      clear: () => {
        persist([]);
        setMessage("");
      },
    }),
    [message, persist, slugs],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare");
  return ctx;
}

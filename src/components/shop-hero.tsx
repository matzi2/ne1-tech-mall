"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { shopBanners } from "@/lib/shop";

export function ShopHero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % shopBanners.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, []);

  const banner = shopBanners[index];

  return (
    <section className="bg-navy text-white">
      <div className="mx-auto flex min-h-[320px] max-w-6xl flex-col justify-center px-4 py-12 md:min-h-[380px]">
        <p className="text-sm font-semibold tracking-wide text-amber-300">{banner.kicker}</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight md:text-5xl">{banner.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 md:text-base">{banner.body}</p>
        <div className="mt-6">
          <Button asChild variant="amber">
            <Link href={banner.href}>{banner.cta}</Link>
          </Button>
        </div>
        <div className="mt-8 flex gap-2">
          {shopBanners.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label={item.kicker}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition ${
                i === index ? "w-8 bg-amber-400" : "w-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

import { brand } from "@/lib/brand";
import { company } from "@/lib/company";
import { cn } from "@/lib/utils";

export function Ne1Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 40 40"
        className={compact ? "h-8 w-8" : "h-9 w-9"}
        aria-hidden="true"
      >
        <rect width="40" height="40" rx="6" fill={brand.navy} />
        <text
          x="20"
          y="27"
          textAnchor="middle"
          fontFamily="Montserrat, Pretendard, sans-serif"
          fontWeight="800"
          fontSize="15"
          fill="#fff"
        >
          NE
          <tspan fill={brand.red}>1</tspan>
        </text>
      </svg>
      <span>
        <span className="block text-sm font-bold leading-none tracking-wide">
          {company.nameEn}
        </span>
        <span className="text-[11px] text-white/70">{company.nameKo} 쇼핑몰</span>
      </span>
    </span>
  );
}

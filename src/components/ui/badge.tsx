import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-transparent bg-sky-100 text-sky-800",
        navy: "border-transparent bg-[#0b1f3a] text-white",
        outline: "border-slate-300 text-slate-700",
        amber: "border-transparent bg-amber-100 text-amber-800",
        muted: "border-transparent bg-slate-100 text-slate-600",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };

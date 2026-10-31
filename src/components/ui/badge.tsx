import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-slate-900 text-white",
        secondary: "border-transparent bg-slate-100 text-slate-800",
        destructive: "border-transparent bg-red-100 text-red-700 border border-red-200",
        outline: "text-slate-700 border border-slate-300",
        // Status Variants
        success: "bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold",
        info: "bg-sky-50 text-sky-700 border border-sky-200 font-semibold",
        warning: "bg-amber-50 text-amber-700 border border-amber-200 font-semibold",
        draft: "bg-slate-100 text-slate-600 border border-slate-200",
        quotation: "bg-blue-50 text-blue-700 border border-blue-200",
        confirmed: "bg-indigo-50 text-indigo-700 border border-indigo-200",
        active: "bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium",
        paused: "bg-amber-50 text-amber-700 border border-amber-200 font-medium",
        closed: "bg-rose-50 text-rose-700 border border-rose-200",
        expired: "bg-gray-100 text-gray-700 border border-gray-300",
        paid: "bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold",
        overdue: "bg-red-100 text-red-800 border border-red-300 font-semibold",
        odoo: "bg-purple-100 text-[#714B67] border border-purple-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-odoo-700 text-white hover:bg-odoo-800 shadow-sm active:translate-y-[1px]",
        secondary:
          "bg-odoo-100 text-odoo-900 hover:bg-odoo-200 active:translate-y-[1px]",
        outline:
          "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm",
        ghost:
          "hover:bg-slate-100 text-slate-700 hover:text-slate-900",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        zoho:
          "bg-zoho-teal text-white hover:opacity-90 shadow-sm",
        pill:
          "rounded-full bg-odoo-700 text-white hover:bg-odoo-800 px-6 shadow-sm active:translate-y-[1px]",
        pillOutline:
          "rounded-full border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 px-6 shadow-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

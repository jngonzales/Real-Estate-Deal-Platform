import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const premiumBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        premium: "badge-premium border-transparent",
        glass: "glass-card text-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground border-border",
        success:
          "border-transparent bg-green-500 dark:bg-green-600 text-white shadow hover:bg-green-600 dark:hover:bg-green-700",
        warning:
          "border-transparent bg-yellow-500 dark:bg-yellow-600 text-white shadow hover:bg-yellow-600 dark:hover:bg-yellow-700",
        info:
          "border-transparent bg-primary dark:bg-primary text-white shadow hover:bg-primary dark:hover:bg-primary/90",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface PremiumBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof premiumBadgeVariants> {
  pulse?: boolean;
}

function PremiumBadge({ className, variant, size, pulse = false, ...props }: PremiumBadgeProps) {
  return (
    <div 
      className={cn(
        premiumBadgeVariants({ variant, size }), 
        pulse && "status-pulse",
        className
      )} 
      {...props} 
    />
  );
}

export { PremiumBadge, premiumBadgeVariants };

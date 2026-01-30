import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        success: "border-transparent bg-success text-success-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",
        outline: "text-foreground",
        // Status variants
        reported: "border-transparent bg-primary-muted text-primary",
        assigned: "border-transparent bg-warning-muted text-warning",
        "in-progress": "border-transparent bg-accent text-accent-foreground",
        resolved: "border-transparent bg-success-muted text-success",
        closed: "border-transparent bg-muted text-muted-foreground",
        // Priority variants
        low: "border-transparent bg-success-muted text-success",
        medium: "border-transparent bg-primary-muted text-primary",
        high: "border-transparent bg-warning-muted text-warning",
        emergency: "border-transparent bg-destructive-muted text-destructive animate-pulse",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

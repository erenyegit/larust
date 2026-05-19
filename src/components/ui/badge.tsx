import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs text-slate-700",
        className,
      )}
    >
      {children}
    </span>
  );
}

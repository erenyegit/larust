import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "default" &&
          "border border-blue-600 bg-blue-600 text-white hover:bg-blue-700",
        variant === "secondary" &&
          "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50",
        variant === "ghost" && "bg-transparent text-slate-600 hover:bg-slate-100",
        variant === "danger" &&
          "border border-rose-600 bg-rose-600 text-white hover:bg-rose-700",
        className,
      )}
      {...props}
    />
  );
}

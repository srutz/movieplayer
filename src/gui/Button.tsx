"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  children,
  ...props
}: {
  className?: string;
  children: ReactNode;
} & ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "min-w-[160px]",
        "px-4 py-2 rounded-md bg-blue-500 text-white",
        "font-semibold hover:bg-blue-600 transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  visible: boolean;
  message: string;
}

export function Toast({ visible, message }: ToastProps) {
  return (
    <div
      className={cn(
        "fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 -translate-y-3 pointer-events-none"
      )}
    >
      <div className="bg-card border border-border rounded-2xl shadow-xl px-5 py-3 flex items-center gap-2.5">
        <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
        <span className="text-sm font-medium text-foreground whitespace-nowrap">
          {message}
        </span>
      </div>
    </div>
  );
}

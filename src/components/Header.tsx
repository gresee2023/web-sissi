"use client";

import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Sissi的小世界
            </h1>
            <p className="text-xs text-muted-foreground">
              记录生活的点点滴滴
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

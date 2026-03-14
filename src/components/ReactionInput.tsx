"use client";

import { useState, useCallback } from "react";
import { Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/data/mock";

const QUICK_TAGS: Record<string, string[]> = {
  dad: ["摸摸头~", "加油加油！", "给你买！", "老爸支持你"],
  mom: ["妈妈抱抱\ud83d\udc96", "真棒呀\u2728", "注意休息哦", "想你啦~"],
};

interface ReactionInputProps {
  postId: string;
  role: Role;
  onSent: () => void;
  showToast: (message: string) => void;
}

export function ReactionInput({ postId, role, onSent, showToast }: ReactionInputProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const tags = QUICK_TAGS[role] || [];

  const send = useCallback(
    async (content: string) => {
      if (!content.trim() || sending) return;
      setSending(true);
      try {
        const res = await fetch(`/api/posts/${postId}/reactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, content: content.trim() }),
        });
        if (!res.ok) throw new Error();
        setText("");
        showToast("已贴上去啦！");
        onSent();
      } catch {
        showToast("发送失败，请重试");
      } finally {
        setSending(false);
      }
    },
    [postId, role, sending, onSent, showToast]
  );

  return (
    <div className="space-y-2">
      {/* Text input + send button */}
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              send(text);
            }
          }}
          placeholder="写下你想贴在日记上的话..."
          disabled={sending}
          maxLength={30}
          className="flex-1 h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary transition-colors disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => send(text)}
          disabled={!text.trim() || sending}
          className={cn(
            "h-10 px-4 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all shrink-0",
            text.trim() && !sending
              ? "bg-primary text-primary-foreground hover:brightness-105 active:scale-[0.97]"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          贴上去！
        </button>
      </div>

      {/* Quick tags */}
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => send(tag)}
            disabled={sending}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 transition-all disabled:opacity-50"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Loader2, CalendarCheck, CheckCircle2, MessageSquarePlus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactionInput } from "./ReactionInput";
import type { Post, WishStatus, Role } from "@/data/mock";

const WISH_BADGE: Record<WishStatus, { label: string; className: string }> = {
  pending: {
    label: "\ud83d\udcad \u8bb8\u613f\u4e2d",
    className: "bg-violet-100 text-violet-700",
  },
  planned: {
    label: "\ud83d\udcc5 \u5df2\u5b89\u6392",
    className: "bg-sky-100 text-sky-700",
  },
  completed: {
    label: "\u2705 \u5df2\u5b8c\u6210",
    className: "bg-emerald-100 text-emerald-700",
  },
};

interface ParentTimelineProps {
  posts: Post[];
  loading: boolean;
  role: Role;
  onWishUpdated: () => void;
  showToast: (message: string) => void;
}

export function ParentTimeline({ posts, loading, role, onWishUpdated, showToast }: ParentTimelineProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedReaction, setExpandedReaction] = useState<string | null>(null);

  const handleWishAction = useCallback(
    async (postId: string, newStatus: WishStatus) => {
      setUpdatingId(postId);
      try {
        const res = await fetch(`/api/posts/${postId}/wish-status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wishStatus: newStatus, role }),
        });

        if (!res.ok) throw new Error("操作失败");

        showToast(
          newStatus === "planned" ? "已标记为已安排" : "已标记为已完成"
        );
        onWishUpdated();
      } catch {
        showToast("操作失败，请重试");
      } finally {
        setUpdatingId(null);
      }
    },
    [onWishUpdated, showToast, role]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8">
        还没有发布任何内容
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => {
        const isUpdating = updatingId === post.id;
        const wishBadge = post.wishStatus ? WISH_BADGE[post.wishStatus] : null;

        return (
          <div
            key={post.id}
            className={cn(
              "bg-card border rounded-2xl p-4 flex gap-3",
              post.wishStatus ? "border-amber-200 bg-amber-50/30" : "border-border"
            )}
          >
            {/* Thumbnail */}
            {post.imageUrls.length > 0 && (
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                <Image
                  src={post.imageUrls[0]}
                  alt=""
                  fill
                  sizes="828px"
                  className="object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
                {post.content}
              </p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-xs text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString("zh-CN", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {wishBadge && (
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      wishBadge.className
                    )}
                  >
                    {wishBadge.label}
                  </span>
                )}
                {post.tags.length > 0 && (
                  <span className="text-xs text-muted-foreground/60">
                    {post.tags.map((t) => `#${t}`).join(" ")}
                  </span>
                )}
              </div>

              {/* Wish action buttons */}
              {post.wishStatus === "pending" && (
                <button
                  type="button"
                  onClick={() => handleWishAction(post.id, "planned")}
                  disabled={isUpdating}
                  className={cn(
                    "mt-2 px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all",
                    isUpdating
                      ? "bg-sky-100 text-sky-400 cursor-not-allowed"
                      : "bg-sky-100 text-sky-700 hover:bg-sky-200 active:scale-[0.97]"
                  )}
                >
                  {isUpdating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CalendarCheck className="w-3.5 h-3.5" />
                  )}
                  标记为已安排
                </button>
              )}
              {post.wishStatus === "planned" && (
                <button
                  type="button"
                  onClick={() => handleWishAction(post.id, "completed")}
                  disabled={isUpdating}
                  className={cn(
                    "mt-2 px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all",
                    isUpdating
                      ? "bg-emerald-100 text-emerald-400 cursor-not-allowed"
                      : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 active:scale-[0.97]"
                  )}
                >
                  {isUpdating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  标记为已完成
                </button>
              )}

              {/* Reaction toggle */}
              <button
                type="button"
                onClick={() => setExpandedReaction(expandedReaction === post.id ? null : post.id)}
                className="mt-2 px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all bg-pink-50 text-pink-600 hover:bg-pink-100 active:scale-[0.97]"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                贴纸留言
                <ChevronDown className={cn("w-3 h-3 transition-transform", expandedReaction === post.id && "rotate-180")} />
              </button>

              {/* Reaction input (expanded) */}
              {expandedReaction === post.id && (
                <div className="mt-2">
                  <ReactionInput
                    postId={post.id}
                    role={role}
                    onSent={onWishUpdated}
                    showToast={showToast}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";
import { ConfirmDialog } from "./ConfirmDialog";
import { cn } from "@/lib/utils";
import type { Post } from "@/data/mock";

interface PostManagerProps {
  posts: Post[];
  loading: boolean;
  onEdit: (post: Post) => void;
  onDeleted: () => void;
  showToast: (message: string) => void;
}

export function PostManager({ posts, loading, onEdit, onDeleted, showToast }: PostManagerProps) {
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/posts/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("删除失败");

      showToast("删除成功");
      setDeleteTarget(null);
      onDeleted();
    } catch {
      showToast("删除失败，请重试");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, onDeleted, showToast]);

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
    <>
      <div className="space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-card border border-border rounded-2xl p-4 flex gap-3"
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
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString("zh-CN", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {post.tags.length > 0 && (
                  <span className="text-xs text-muted-foreground/60">
                    {post.tags.map((t) => `#${t}`).join(" ")}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onEdit(post)}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                  "text-muted-foreground hover:text-primary hover:bg-primary/10"
                )}
                title="编辑"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(post)}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                  "text-muted-foreground hover:text-red-500 hover:bg-red-50"
                )}
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="删除确认"
        message="确定要删除这条记录吗？关联的图片也会被一并删除，此操作不可撤销。"
        confirmLabel="确定删除"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

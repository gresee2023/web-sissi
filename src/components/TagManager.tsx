"use client";

import { useMemo, useState, useCallback } from "react";
import { X } from "lucide-react";
import { TAGS } from "@/data/mock";
import { ConfirmDialog } from "./ConfirmDialog";
import type { Post } from "@/data/mock";

const PRESET_TAG_NAMES = new Set(TAGS.filter((t) => t.id !== "all").map((t) => t.name));

interface TagManagerProps {
  posts: Post[];
  onTagDeleted: () => void;
  showToast: (message: string) => void;
}

export function TagManager({ posts, onTagDeleted, showToast }: TagManagerProps) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Collect all unique tags: preset tags + any custom tags from posts
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    // Include all preset tags
    TAGS.filter((t) => t.id !== "all").forEach((t) => tagSet.add(t.name));
    // Include any custom tags from posts
    posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort((a, b) => {
      // Preset tags first (in original order), then custom tags
      const aPreset = PRESET_TAG_NAMES.has(a);
      const bPreset = PRESET_TAG_NAMES.has(b);
      if (aPreset !== bPreset) return aPreset ? -1 : 1;
      if (aPreset && bPreset) {
        const aIdx = TAGS.findIndex((t) => t.name === a);
        const bIdx = TAGS.findIndex((t) => t.name === b);
        return aIdx - bIdx;
      }
      return a.localeCompare(b, "zh-CN");
    });
  }, [posts]);

  // Count how many posts use each tag
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((p) => p.tags.forEach((t) => {
      counts[t] = (counts[t] || 0) + 1;
    }));
    return counts;
  }, [posts]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const res = await fetch("/api/tags", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagName: deleteTarget }),
      });

      if (!res.ok) throw new Error("删除失败");

      showToast(`标签「${deleteTarget}」已从所有内容中移除`);
      setDeleteTarget(null);
      onTagDeleted();
    } catch {
      showToast("删除失败，请重试");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, onTagDeleted, showToast]);

  if (allTags.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        暂无使用中的标签
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => {
          const preset = TAGS.find((t) => t.name === tag);
          return (
            <div
              key={tag}
              className="flex items-center gap-1 pl-3 pr-1.5 py-1.5 rounded-full bg-muted text-sm font-medium text-muted-foreground"
            >
              <span className={preset ? "text-foreground" : ""}>
                #{tag}
              </span>
              <span className="text-xs text-muted-foreground/60 ml-0.5">
                {tagCounts[tag] || 0}
              </span>
              <button
                type="button"
                onClick={() => setDeleteTarget(tag)}
                className="w-5 h-5 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-red-500 hover:bg-red-50 transition-colors ml-0.5"
                title={`删除标签「${tag}」`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="删除标签"
        message={`确定要删除标签「${deleteTarget}」吗？该标签将从所有包含它的内容中移除。`}
        confirmLabel="确定删除"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

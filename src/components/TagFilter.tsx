"use client";

import { cn } from "@/lib/utils";
import { Tag } from "@/data/mock";

interface TagFilterProps {
  tags: Tag[];
  selectedTag: string;
  onSelectTag: (tagId: string) => void;
}

export function TagFilter({ tags, selectedTag, onSelectTag }: TagFilterProps) {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 pb-2 px-1">
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => onSelectTag(tag.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
              "hover:scale-105 active:scale-95",
              selectedTag === tag.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card text-muted-foreground hover:bg-muted border border-border"
            )}
          >
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  );
}

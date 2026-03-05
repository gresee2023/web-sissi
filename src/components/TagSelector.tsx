"use client";

import { useState, useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import { TAGS } from "@/data/mock";
import { cn } from "@/lib/utils";

const PRESET_TAGS = TAGS.filter((t) => t.id !== "all");

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export function TagSelector({ selectedTags, onChange }: TagSelectorProps) {
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");

  const allTagNames = useMemo(
    () => [...PRESET_TAGS.map((t) => t.name), ...customTags],
    [customTags]
  );

  const toggleTag = useCallback(
    (name: string) => {
      onChange(
        selectedTags.includes(name)
          ? selectedTags.filter((t) => t !== name)
          : [...selectedTags, name]
      );
    },
    [selectedTags, onChange]
  );

  const addCustomTag = useCallback(() => {
    const trimmed = customInput.trim();
    if (!trimmed || allTagNames.includes(trimmed)) {
      setCustomInput("");
      return;
    }
    setCustomTags((prev) => [...prev, trimmed]);
    onChange([...selectedTags, trimmed]);
    setCustomInput("");
  }, [customInput, allTagNames, selectedTags, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addCustomTag();
      }
    },
    [addCustomTag]
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {PRESET_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag.name);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.name)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer",
                "hover:scale-105 active:scale-95",
                isSelected
                  ? `tag-${tag.name}`
                  : "bg-muted text-muted-foreground"
              )}
            >
              #{tag.name}
            </button>
          );
        })}

        {customTags.map((name) => {
          const isSelected = selectedTags.includes(name);
          return (
            <button
              key={name}
              type="button"
              onClick={() => toggleTag(name)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer",
                "hover:scale-105 active:scale-95",
                isSelected
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              #{name}
            </button>
          );
        })}
      </div>

      {/* Custom tag input */}
      <div className="flex gap-2 mt-3">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="自定义标签..."
          maxLength={10}
          className="flex-1 min-w-0 rounded-xl border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary transition-colors"
        />
        <button
          type="button"
          onClick={addCustomTag}
          disabled={!customInput.trim()}
          className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

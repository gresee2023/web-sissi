"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import { TagSelector } from "./TagSelector";
import { cn } from "@/lib/utils";

const MAX_LENGTH = 300;
const WARN_THRESHOLD = 270;

interface PostFormProps {
  onPublished: () => void;
}

export function PostForm({ onPublished }: PostFormProps) {
  const [images, setImages] = useState<File[]>([]);
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, []);

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value.slice(0, MAX_LENGTH);
      setContent(value);
      adjustTextareaHeight();
    },
    [adjustTextareaHeight]
  );

  const handleSubmit = useCallback(async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Reset form
    setImages([]);
    setContent("");
    setSelectedTags([]);
    setIsSubmitting(false);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    onPublished();
  }, [content, isSubmitting, onPublished]);

  const canSubmit = content.trim().length > 0 && !isSubmitting;

  return (
    <div className="space-y-5">
      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          图片
        </label>
        <ImageUploader images={images} onChange={setImages} />
      </div>

      {/* Textarea */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          内容
        </label>
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder="记录此刻的心情..."
            rows={4}
            className="w-full min-h-[120px] rounded-2xl border border-border bg-background px-4 py-3 text-[15px] leading-relaxed outline-none resize-none focus:border-primary transition-colors"
          />
          <span
            className={cn(
              "absolute bottom-3 right-3 text-xs",
              content.length >= WARN_THRESHOLD
                ? "text-red-400"
                : "text-muted-foreground/60"
            )}
          >
            {content.length}/{MAX_LENGTH}
          </span>
        </div>
      </div>

      {/* Tag selector */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          标签
        </label>
        <TagSelector selectedTags={selectedTags} onChange={setSelectedTags} />
      </div>

      {/* Submit button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={cn(
          "w-full py-3 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200",
          canSubmit
            ? "bg-primary text-primary-foreground hover:brightness-105 active:scale-[0.98] shadow-sm"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            发布中...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            发布
          </>
        )}
      </button>
    </div>
  );
}

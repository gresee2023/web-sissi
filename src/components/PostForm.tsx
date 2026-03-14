"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Loader2, Save, Star } from "lucide-react";
import imageCompression from "browser-image-compression";
import { ImageUploader } from "./ImageUploader";
import { TagSelector } from "./TagSelector";
import { cn } from "@/lib/utils";
import type { Post, Mood } from "@/data/mock";

const MAX_LENGTH = 300;
const WARN_THRESHOLD = 270;

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1920,
  initialQuality: 0.8,
  useWebWorker: true,
};

const MOOD_OPTIONS: { value: Mood; emoji: string }[] = [
  { value: "sunny", emoji: "\u2600\ufe0f" },
  { value: "cloudy", emoji: "\u2601\ufe0f" },
  { value: "rainy", emoji: "\ud83c\udf27\ufe0f" },
  { value: "lightning", emoji: "\u26a1" },
];

interface PostFormProps {
  onPublished: () => void;
  editingPost?: Post | null;
  onCancelEdit?: () => void;
  showWishToggle?: boolean;
}

export function PostForm({ onPublished, editingPost, onCancelEdit, showWishToggle = false }: PostFormProps) {
  const [images, setImages] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isWish, setIsWish] = useState(false);
  const [mood, setMood] = useState<Mood | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isEditing = !!editingPost;

  // Populate form when editingPost changes
  useEffect(() => {
    if (editingPost) {
      setContent(editingPost.content);
      setSelectedTags([...editingPost.tags]);
      setExistingImageUrls([...editingPost.imageUrls]);
      setImages([]);
      setRemovedImageUrls([]);
      setIsWish(!!editingPost.wishStatus);
      setMood(editingPost.mood ?? null);
      // Adjust textarea height after content is set
      setTimeout(() => adjustTextareaHeight(), 0);
    } else {
      // Reset form when exiting edit mode
      setContent("");
      setSelectedTags([]);
      setExistingImageUrls([]);
      setImages([]);
      setRemovedImageUrls([]);
      setIsWish(false);
      setMood(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }, [editingPost]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleRemoveExistingImage = useCallback(
    (index: number) => {
      const url = existingImageUrls[index];
      setRemovedImageUrls((prev) => [...prev, url]);
      setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
    },
    [existingImageUrls]
  );

  const handleSubmit = useCallback(async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Step 1: Compress & upload NEW images
      const newImageUrls: string[] = [];

      if (images.length > 0) {
        setSubmitStatus("压缩图片中...");

        for (let i = 0; i < images.length; i++) {
          setSubmitStatus(`压缩图片 ${i + 1}/${images.length}...`);
          const compressed = await imageCompression(images[i], COMPRESSION_OPTIONS);

          setSubmitStatus(`上传图片 ${i + 1}/${images.length}...`);
          const formData = new FormData();
          formData.append("file", compressed, images[i].name);

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!uploadRes.ok) {
            throw new Error(`图片 ${i + 1} 上传失败`);
          }

          const { url } = await uploadRes.json();
          newImageUrls.push(url);
        }
      }

      if (isEditing && editingPost) {
        // Update existing post
        setSubmitStatus("保存中...");
        const finalImageUrls = [...existingImageUrls, ...newImageUrls];

        const patchRes = await fetch(`/api/posts/${editingPost.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: content.trim(),
            imageUrls: finalImageUrls,
            tags: selectedTags,
            removedImageUrls,
          }),
        });

        if (!patchRes.ok) throw new Error("保存失败");
      } else {
        // Create new post
        setSubmitStatus("发布中...");
        const postRes = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: content.trim(),
            imageUrls: newImageUrls,
            tags: selectedTags,
            ...(isWish ? { wishStatus: "pending" } : {}),
            ...(mood ? { mood } : {}),
          }),
        });

        if (!postRes.ok) throw new Error("发布失败");
      }

      // Reset form
      setImages([]);
      setExistingImageUrls([]);
      setRemovedImageUrls([]);
      setContent("");
      setSelectedTags([]);
      setIsWish(false);
      setMood(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      onPublished();
    } catch (err) {
      setSubmitStatus(err instanceof Error ? err.message : "操作失败，请重试");
      setTimeout(() => setSubmitStatus(""), 2000);
    } finally {
      setIsSubmitting(false);
    }
  }, [content, images, selectedTags, isWish, mood, isSubmitting, isEditing, editingPost, existingImageUrls, removedImageUrls, onPublished]);

  const canSubmit = content.trim().length > 0 && !isSubmitting;

  return (
    <div className="space-y-5">
      {/* Edit mode header */}
      {isEditing && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5">
          <span className="text-sm font-medium text-amber-700">正在编辑</span>
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-sm text-amber-600 hover:text-amber-800 underline"
          >
            取消编辑
          </button>
        </div>
      )}

      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          图片
        </label>

        {/* Existing images (edit mode) */}
        {existingImageUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {existingImageUrls.map((url, index) => (
              <div
                key={url}
                className="relative aspect-square rounded-xl overflow-hidden bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`已有图片 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingImage(index)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
                >
                  <span className="text-xs font-bold">✕</span>
                </button>
              </div>
            ))}
          </div>
        )}

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

      {/* Mood selector */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          此刻心情（可选）
        </label>
        <div className="flex gap-2">
          {MOOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMood(mood === opt.value ? null : opt.value)}
              className={cn(
                "w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all duration-150",
                mood === opt.value
                  ? "bg-primary/15 ring-2 ring-primary/50 scale-110"
                  : "bg-muted/50 hover:bg-muted active:scale-95"
              )}
            >
              {opt.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Wish toggle (daughter only) */}
      {showWishToggle && !isEditing && (
        <button
          type="button"
          onClick={() => setIsWish((v) => !v)}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all duration-200",
            isWish
              ? "border-amber-300 bg-amber-50"
              : "border-border bg-background hover:border-muted-foreground/30"
          )}
        >
          <Star
            className={cn(
              "w-5 h-5 shrink-0 transition-colors",
              isWish ? "text-amber-500 fill-amber-400" : "text-muted-foreground/50"
            )}
          />
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              isWish ? "text-amber-700" : "text-muted-foreground"
            )}
          >
            这是一个周末心愿
          </span>
          <div
            className={cn(
              "ml-auto w-10 h-6 rounded-full p-0.5 transition-colors duration-200",
              isWish ? "bg-amber-400" : "bg-muted"
            )}
          >
            <div
              className={cn(
                "w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                isWish ? "translate-x-4" : "translate-x-0"
              )}
            />
          </div>
        </button>
      )}

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
            {submitStatus || (isEditing ? "保存中..." : "发布中...")}
          </>
        ) : isEditing ? (
          <>
            <Save className="w-4 h-4" />
            保存修改
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

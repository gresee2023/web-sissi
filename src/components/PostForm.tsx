"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Loader2, Save } from "lucide-react";
import imageCompression from "browser-image-compression";
import { ImageUploader } from "./ImageUploader";
import { TagSelector } from "./TagSelector";
import { cn } from "@/lib/utils";
import type { Post } from "@/data/mock";

const MAX_LENGTH = 300;
const WARN_THRESHOLD = 270;

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1920,
  initialQuality: 0.8,
  useWebWorker: true,
};

interface PostFormProps {
  onPublished: () => void;
  editingPost?: Post | null;
  onCancelEdit?: () => void;
}

export function PostForm({ onPublished, editingPost, onCancelEdit }: PostFormProps) {
  const [images, setImages] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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
      // Adjust textarea height after content is set
      setTimeout(() => adjustTextareaHeight(), 0);
    } else {
      // Reset form when exiting edit mode
      setContent("");
      setSelectedTags([]);
      setExistingImageUrls([]);
      setImages([]);
      setRemovedImageUrls([]);
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
  }, [content, images, selectedTags, isSubmitting, isEditing, editingPost, existingImageUrls, removedImageUrls, onPublished]);

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

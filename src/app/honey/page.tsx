"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Header } from "@/components";
import { PinGate } from "@/components/PinGate";
import { PostForm } from "@/components/PostForm";
import { PostManager } from "@/components/PostManager";
import { TagManager } from "@/components/TagManager";
import { Toast } from "@/components/Toast";
import type { Post } from "@/data/mock";

export default function HoneyPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ visible: true, message });
    toastTimer.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const fetchPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch {
      // silent
    } finally {
      setPostsLoading(false);
    }
  }, []);

  const handleUnlock = useCallback(() => {
    setIsUnlocked(true);
    fetchPosts();
  }, [fetchPosts]);

  const handlePublished = useCallback(() => {
    showToast(editingPost ? "修改已保存！" : "发布成功！");
    setEditingPost(null);
    fetchPosts();
  }, [showToast, editingPost, fetchPosts]);

  const handleEdit = useCallback((post: Post) => {
    setEditingPost(post);
    // Scroll to form
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingPost(null);
  }, []);

  const handleDeleted = useCallback(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-lg mx-auto px-4 py-6">
        {!isUnlocked ? (
          <PinGate onSuccess={handleUnlock} />
        ) : (
          <div className="space-y-8">
            {/* Publishing / Editing Form */}
            <section ref={formRef}>
              <h2 className="text-base font-semibold text-foreground mb-4">
                {editingPost ? "编辑内容" : "发布新内容"}
              </h2>
              <PostForm
                onPublished={handlePublished}
                editingPost={editingPost}
                onCancelEdit={handleCancelEdit}
              />
            </section>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Tag Management */}
            <section>
              <h2 className="text-base font-semibold text-foreground mb-4">
                标签管理
              </h2>
              <TagManager
                posts={posts}
                onTagDeleted={fetchPosts}
                showToast={showToast}
              />
            </section>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Post Management List */}
            <section>
              <h2 className="text-base font-semibold text-foreground mb-4">
                内容管理
              </h2>
              <PostManager
                posts={posts}
                loading={postsLoading}
                onEdit={handleEdit}
                onDeleted={handleDeleted}
                showToast={showToast}
              />
            </section>
          </div>
        )}
      </main>

      <Toast visible={toast.visible} message={toast.message} />
    </div>
  );
}

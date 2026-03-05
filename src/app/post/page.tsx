"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Header } from "@/components";
import { PinGate } from "@/components/PinGate";
import { PostForm } from "@/components/PostForm";
import { Toast } from "@/components/Toast";

export default function PostPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleUnlock = useCallback(() => {
    setIsUnlocked(true);
  }, []);

  const handlePublished = useCallback(() => {
    showToast("发布成功！");
  }, [showToast]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-lg mx-auto px-4 py-6">
        {!isUnlocked ? (
          <PinGate onSuccess={handleUnlock} />
        ) : (
          <PostForm onPublished={handlePublished} />
        )}
      </main>

      <Toast visible={toast.visible} message={toast.message} />
    </div>
  );
}

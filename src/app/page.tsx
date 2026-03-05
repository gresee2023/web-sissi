"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Header, TagFilter, PostCard } from "@/components";
import { TAGS, Post } from "@/data/mock";
import { Inbox, Loader2 } from "lucide-react";

export default function Home() {
  const [selectedTag, setSelectedTag] = useState("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = useMemo(() => {
    if (selectedTag === "all") return posts;
    const tagName = TAGS.find((t) => t.id === selectedTag)?.name || "";
    return posts.filter((post) => post.tags.includes(tagName));
  }, [selectedTag, posts]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Tag Filter */}
        <section className="mb-6">
          <TagFilter
            tags={TAGS}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
          />
        </section>

        {/* Posts List */}
        <section className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground/70">
                这里还没有记录哦~
              </p>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-12 pb-8 text-center">
          <p className="text-sm text-muted-foreground">
            用心记录每一天 ✨
          </p>
        </footer>
      </main>
    </div>
  );
}

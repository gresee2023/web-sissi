"use client";

import { useState, useMemo } from "react";
import { Header, TagFilter, PostCard } from "@/components";
import { POSTS, TAGS, Post } from "@/data/mock";
import { Inbox } from "lucide-react";

export default function Home() {
  const [selectedTag, setSelectedTag] = useState("all");

  const filteredPosts = useMemo(() => {
    if (selectedTag === "all") return POSTS;
    return POSTS.filter((post: Post) => post.tags.includes(
      TAGS.find((t) => t.id === selectedTag)?.name || ""
    ));
  }, [selectedTag]);

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

        {/* Posts Grid */}
        <section className="space-y-4">
          {filteredPosts.length > 0 ? (
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

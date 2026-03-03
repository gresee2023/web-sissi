"use client";

import { Post } from "@/data/mock";
import { ImageCarousel } from "./ImageCarousel";
import { formatDate, cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-card rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-border/50 group">
      {/* Date header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-2 text-muted-foreground text-sm">
        <Calendar className="w-4 h-4" />
        <time dateTime={post.createdAt} suppressHydrationWarning>
          {formatDate(post.createdAt)}
        </time>
      </div>

      {/* Image carousel */}
      <div className="px-4">
        <ImageCarousel images={post.images} alt={post.content.slice(0, 20)} />
      </div>

      {/* Content */}
      <div className="p-4 pt-3 space-y-3">
        <p className="text-foreground text-[15px] leading-relaxed">
          {post.content}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                `tag-${tag}`
              )}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

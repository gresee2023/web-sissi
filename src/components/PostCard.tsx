"use client";

import { Post, WishStatus, Mood } from "@/data/mock";
import { ImageCarousel } from "./ImageCarousel";
import { ReactionStickers } from "./ReactionStickers";
import { formatDate, cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

interface PostCardProps {
  post: Post;
}

/* ── Wish status display config ── */
const WISH_STAMP: Record<WishStatus, { text: string; color: string }> = {
  pending:   { text: "\ud83d\udcad \u8bb8\u613f\u4e2d\u2026",  color: "text-stone-500" },
  planned:   { text: "\ud83d\udcc5 \u5df2\u5b89\u6392\uff01",  color: "text-blue-500" },
  completed: { text: "\u2705 \u5df2\u6253\u5361",    color: "text-emerald-500" },
};

const ROLE_LABEL: Record<string, string> = {
  dad: "\u8001\u7238",
  mom: "\u8001\u5988",
};

const MOOD_EMOJI: Record<Mood, string> = {
  sunny: "\u2600\ufe0f",
  cloudy: "\u2601\ufe0f",
  rainy: "\ud83c\udf27\ufe0f",
  lightning: "\u26a1",
};

const MOOD_BG: Record<Mood, string> = {
  sunny: "bg-amber-100",
  cloudy: "bg-stone-50",
  rainy: "bg-sky-100",
  lightning: "bg-orange-100",
};

/** Pure CSS barcode */
function Barcode() {
  const bars = [
    { w: 2, dark: true },  { w: 1, dark: false }, { w: 3, dark: true },
    { w: 1, dark: false }, { w: 2, dark: true },  { w: 1, dark: false },
    { w: 4, dark: true },  { w: 1, dark: false }, { w: 2, dark: true },
    { w: 2, dark: false }, { w: 3, dark: true },  { w: 1, dark: false },
    { w: 2, dark: true },  { w: 1, dark: false }, { w: 3, dark: true },
    { w: 2, dark: false }, { w: 1, dark: true },  { w: 1, dark: false },
    { w: 4, dark: true },  { w: 1, dark: false }, { w: 2, dark: true },
  ];
  return (
    <div className="flex items-stretch justify-center h-10">
      {bars.map((b, i) => (
        <div
          key={i}
          className={b.dark ? "bg-stone-700/50" : "bg-transparent"}
          style={{ width: `${b.w}px` }}
        />
      ))}
    </div>
  );
}

function WishCard({ post }: PostCardProps) {
  const stamp = WISH_STAMP[post.wishStatus!];
  const assignee = post.wishAssignedBy ? ROLE_LABEL[post.wishAssignedBy] : null;
  const moodBg = post.mood ? MOOD_BG[post.mood] : "bg-white";

  return (
    <div className="relative">
      <div className="stamp-shadow">
        <article className={cn("stamp-card relative", moodBg)}>

          <div className="px-5 pt-5 pb-4 space-y-3">
            {/* Date + mood emoji */}
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <Calendar className="w-3.5 h-3.5" />
              <time dateTime={post.createdAt} suppressHydrationWarning>
                {formatDate(post.createdAt)}
              </time>
              {post.mood && (
                <span className="text-sm" aria-hidden="true">
                  {MOOD_EMOJI[post.mood]}
                </span>
              )}
            </div>

            {post.imageUrls.length > 0 && (
              <div className="-mx-1">
                <ImageCarousel images={post.imageUrls} alt={post.content.slice(0, 20)} />
              </div>
            )}

            <p className="text-gray-700 text-[15px] leading-relaxed">
              {post.content}
            </p>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-medium",
                      `tag-${tag}`
                    )}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mx-5 border-b-2 border-dotted border-gray-300" />

          <div className="px-5 py-3.5 flex items-center gap-4">
            <div className="shrink-0">
              <Barcode />
              <p className="text-[8px] text-gray-300 font-mono text-center tracking-[0.2em] mt-0.5 select-none">
                WISH-{post.id.slice(0, 6).toUpperCase()}
              </p>
            </div>

            <div className="flex-1 min-w-0 space-y-0.5 text-right">
              <p className={cn("wish-handwriting text-base -rotate-2 origin-right", stamp.color)}>
                {stamp.text}
              </p>
              {assignee && (
                <p className="wish-handwriting text-sm text-gray-400 -rotate-1 origin-right">
                  {assignee}
                </p>
              )}
            </div>
          </div>

        </article>
      </div>

      {post.reactions && post.reactions.length > 0 && (
        <ReactionStickers reactions={post.reactions} />
      )}
    </div>
  );
}

export function PostCard({ post }: PostCardProps) {
  if (post.wishStatus) {
    return <WishCard post={post} />;
  }

  const moodBg = post.mood ? MOOD_BG[post.mood] : undefined;

  return (
    <div className="relative">
      <article
        className={cn(
          "rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-border/50 group",
          moodBg || "bg-card"
        )}
      >
        {/* Date header + mood emoji */}
        <div className="px-4 pt-4 pb-2 flex items-center gap-2 text-muted-foreground text-sm">
          <Calendar className="w-4 h-4" />
          <time dateTime={post.createdAt} suppressHydrationWarning>
            {formatDate(post.createdAt)}
          </time>
          {post.mood && (
            <span className="text-base" aria-hidden="true">
              {MOOD_EMOJI[post.mood]}
            </span>
          )}
        </div>

        {post.imageUrls.length > 0 && (
          <div className="px-4">
            <ImageCarousel images={post.imageUrls} alt={post.content.slice(0, 20)} />
          </div>
        )}

        <div className="p-4 pt-3 space-y-3">
          <p className="text-foreground text-[15px] leading-relaxed">
            {post.content}
          </p>

          {post.tags.length > 0 && (
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
          )}
        </div>
      </article>

      {post.reactions && post.reactions.length > 0 && (
        <ReactionStickers reactions={post.reactions} />
      )}
    </div>
  );
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allPosts = await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt));

    return NextResponse.json(allPosts);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { content, imageUrls, tags } = await request.json();

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const [newPost] = await db
      .insert(posts)
      .values({
        content: content.trim(),
        imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
        tags: Array.isArray(tags) ? tags : [],
      })
      .returning();

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Failed to create post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

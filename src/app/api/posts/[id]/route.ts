import { NextResponse } from "next/server";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { del } from "@vercel/blob";

/**
 * DELETE /api/posts/[id]
 * 1. Read imageUrls from the post
 * 2. Delete all images from Vercel Blob
 * 3. Delete the database record
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch the post first to get its image URLs
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Delete all associated images from Vercel Blob
    if (post.imageUrls.length > 0) {
      await del(post.imageUrls);
    }

    // Delete the database record
    await db.delete(posts).where(eq(posts.id, id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/posts/[id]
 * Accepts: { content?, tags?, imageUrls?, removedImageUrls? }
 * - removedImageUrls: URLs to delete from Vercel Blob
 * - imageUrls: the final list of image URLs to keep
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, tags, imageUrls, removedImageUrls } = body;

    // Verify the post exists
    const [existing] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Delete removed images from Vercel Blob
    if (Array.isArray(removedImageUrls) && removedImageUrls.length > 0) {
      await del(removedImageUrls);
    }

    // Build the update payload (only include provided fields)
    const updateData: Record<string, unknown> = {};

    if (typeof content === "string") {
      if (!content.trim()) {
        return NextResponse.json(
          { error: "Content cannot be empty" },
          { status: 400 }
        );
      }
      updateData.content = content.trim();
    }

    if (Array.isArray(tags)) {
      updateData.tags = tags;
    }

    if (Array.isArray(imageUrls)) {
      updateData.imageUrls = imageUrls;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

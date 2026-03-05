import { NextResponse } from "next/server";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { sql } from "drizzle-orm";

/**
 * DELETE /api/tags
 * Remove a tag from ALL posts that contain it.
 * Body: { tagName: string }
 */
export async function DELETE(request: Request) {
  try {
    const { tagName } = await request.json();

    if (!tagName || typeof tagName !== "string" || !tagName.trim()) {
      return NextResponse.json(
        { error: "tagName is required" },
        { status: 400 }
      );
    }

    const name = tagName.trim();

    // Use PostgreSQL array_remove to strip the tag from all posts
    await db
      .update(posts)
      .set({
        tags: sql`array_remove(${posts.tags}, ${name})`,
      })
      .where(sql`${name} = ANY(${posts.tags})`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete tag:", error);
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * POST /api/posts/[id]/reactions
 * Append a reaction to the post's reactions jsonb array.
 * Body: { role: "dad" | "mom", content: string }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { role, content } = await request.json();

    if (!role || !["dad", "mom"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Append the new reaction using jsonb concatenation
    const reaction = { role, content: content.trim(), ts: Date.now() };

    const [updated] = await db
      .update(posts)
      .set({
        reactions: sql`${posts.reactions} || ${JSON.stringify([reaction])}::jsonb`,
      })
      .where(eq(posts.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to add reaction:", error);
    return NextResponse.json(
      { error: "Failed to add reaction" },
      { status: 500 }
    );
  }
}

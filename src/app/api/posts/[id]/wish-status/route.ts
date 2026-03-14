import { NextResponse } from "next/server";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";

const VALID_TRANSITIONS: Record<string, string> = {
  pending: "planned",
  planned: "completed",
};

/**
 * PATCH /api/posts/[id]/wish-status
 * Advance the wish status to the next stage.
 * Body: { wishStatus: "planned" | "completed", role?: "dad" | "mom" }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { wishStatus, role } = await request.json();

    if (!wishStatus || !["planned", "completed"].includes(wishStatus)) {
      return NextResponse.json(
        { error: "Invalid wishStatus" },
        { status: 400 }
      );
    }

    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Validate the transition: pending -> planned -> completed
    const currentStatus = post.wishStatus;
    if (!currentStatus || VALID_TRANSITIONS[currentStatus] !== wishStatus) {
      return NextResponse.json(
        { error: `Cannot transition from "${currentStatus}" to "${wishStatus}"` },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { wishStatus };

    // Record who assigned the wish (only on first transition: pending -> planned)
    if (wishStatus === "planned" && role) {
      updateData.wishAssignedBy = role;
    }

    const [updated] = await db
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update wish status:", error);
    return NextResponse.json(
      { error: "Failed to update wish status" },
      { status: 500 }
    );
  }
}

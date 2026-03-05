import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  imageUrls: text("image_urls").array().notNull().default([]),
  tags: text("tags").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

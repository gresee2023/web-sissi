import { pgTable, uuid, text, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  imageUrls: text("image_urls").array().notNull().default([]),
  tags: text("tags").array().notNull().default([]),
  wishStatus: varchar("wish_status", { length: 20 }),
  wishAssignedBy: varchar("wish_assigned_by", { length: 20 }),
  reactions: jsonb("reactions").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

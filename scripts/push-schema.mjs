import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Creating posts table...");
  await sql`
    CREATE TABLE IF NOT EXISTS "posts" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "content" text NOT NULL,
      "image_urls" text[] DEFAULT '{}' NOT NULL,
      "tags" text[] DEFAULT '{}' NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    )
  `;
  console.log("Done! posts table created.");
}

main().catch(console.error);

-- Add parent_id column to comments table to support threaded replies
ALTER TABLE "public"."comments" 
ADD COLUMN "parent_id" INTEGER REFERENCES "public"."comments"("id") ON DELETE CASCADE;

-- Add index for faster queries on parent_id
CREATE INDEX "comments_parent_id_idx" ON "public"."comments" ("parent_id");

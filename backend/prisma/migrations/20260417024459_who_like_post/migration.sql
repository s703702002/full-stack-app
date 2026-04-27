/*
  Warnings:

  - The `reset_token_expires` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "reset_token_expires",
ADD COLUMN     "reset_token_expires" TIMESTAMP(3);

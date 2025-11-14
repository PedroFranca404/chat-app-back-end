/*
  Warnings:

  - You are about to drop the `AccessTokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RefreshTokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."AccessTokens" DROP CONSTRAINT "AccessTokens_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."RefreshTokens" DROP CONSTRAINT "RefreshTokens_user_id_fkey";

-- DropTable
DROP TABLE "public"."AccessTokens";

-- DropTable
DROP TABLE "public"."RefreshTokens";

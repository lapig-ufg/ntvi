-- CreateEnum
CREATE TYPE "public"."TypeStatus" AS ENUM ('INCOMPLETE', 'CACHING', 'READY');

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "status" "TypeStatus" NOT NULL DEFAULT E'INCOMPLETE';

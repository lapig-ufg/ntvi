-- CreateEnum
CREATE TYPE "public"."TypeLanguage" AS ENUM ('pt', 'en');

-- CreateEnum
CREATE TYPE "public"."TypeTheme" AS ENUM ('default', 'cosmic', 'corporate', 'dark');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lang" "TypeLanguage" NOT NULL DEFAULT E'en',
ADD COLUMN     "theme" "TypeTheme" NOT NULL DEFAULT E'default';

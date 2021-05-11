/*
  Warnings:

  - You are about to drop the column `lang` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "lang",
ADD COLUMN     "language" "TypeLanguage" NOT NULL DEFAULT E'en';

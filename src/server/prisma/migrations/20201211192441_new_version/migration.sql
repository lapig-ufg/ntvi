-- CreateEnum
CREATE TYPE "public"."TypeUser" AS ENUM ('USER', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "public"."TypeUserInCampaign" AS ENUM ('INSPETOR', 'SUPERVISOR', 'ADMIN');

-- CreateTable
CREATE TABLE "Organization" (
"id" SERIAL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UseClass" (
"id" SERIAL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
"id" SERIAL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "organizationId" INTEGER,
    "geeKey" TEXT,
    "password" TEXT,
    "typeUserInCampaign" "TypeUserInCampaign" NOT NULL DEFAULT E'INSPETOR',
    "typeUser" "TypeUser" NOT NULL DEFAULT E'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "terms" BOOLEAN NOT NULL DEFAULT false,
    "picture" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD FOREIGN KEY("organizationId")REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

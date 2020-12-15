-- CreateEnum
CREATE TYPE "public"."TypeUser" AS ENUM ('USER', 'ADMIN', 'ROOT');

-- CreateEnum
CREATE TYPE "public"."TypePeriod" AS ENUM ('YEARLY', 'MONTHLY');

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
CREATE TABLE "Satellite" (
"id" SERIAL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Composition" (
"id" SERIAL,
    "colors" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "satelliteId" INTEGER,
    "campaignId" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Point" (
"id" SERIAL,
    "latitude" TEXT,
    "longitude" TEXT,
    "info" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
"id" SERIAL,
    "date" TIMESTAMP(3),
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "satelliteId" INTEGER,
    "campaignId" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
"id" SERIAL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "numInspectors" INTEGER NOT NULL,
    "typePeriod" "TypePeriod" NOT NULL DEFAULT E'YEARLY',
    "initialDate" TIMESTAMP(3) NOT NULL,
    "finalDate" TIMESTAMP(3) NOT NULL,
    "publish" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsersOnCampaigns" (
    "userId" INTEGER NOT NULL,
    "campaignId" INTEGER NOT NULL,
    "typeUserInCampaign" "TypeUserInCampaign" NOT NULL DEFAULT E'INSPETOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId","campaignId")
);

-- CreateTable
CREATE TABLE "User" (
"id" SERIAL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "geeKey" TEXT,
    "password" TEXT,
    "typeUser" "TypeUser" NOT NULL DEFAULT E'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "terms" BOOLEAN NOT NULL DEFAULT false,
    "picture" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "organizationId" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CampaignToUseClass" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_CampaignToUseClass_AB_unique" ON "_CampaignToUseClass"("A", "B");

-- CreateIndex
CREATE INDEX "_CampaignToUseClass_B_index" ON "_CampaignToUseClass"("B");

-- AddForeignKey
ALTER TABLE "Composition" ADD FOREIGN KEY("satelliteId")REFERENCES "Satellite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Composition" ADD FOREIGN KEY("campaignId")REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Point" ADD FOREIGN KEY("campaignId")REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD FOREIGN KEY("satelliteId")REFERENCES "Satellite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD FOREIGN KEY("campaignId")REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD FOREIGN KEY("organizationId")REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnCampaigns" ADD FOREIGN KEY("userId")REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnCampaigns" ADD FOREIGN KEY("campaignId")REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD FOREIGN KEY("organizationId")REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CampaignToUseClass" ADD FOREIGN KEY("A")REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CampaignToUseClass" ADD FOREIGN KEY("B")REFERENCES "UseClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

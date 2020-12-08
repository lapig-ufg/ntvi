# Migration `20201130190846-columns-not-null`

This migration has been generated by Tharles de Sousa Andrade at 11/30/2020, 4:08:46 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "state" DROP NOT NULL,
ALTER COLUMN "country" DROP NOT NULL,
ALTER COLUMN "organizationId" DROP NOT NULL,
ALTER COLUMN "geeKey" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20201130175353-merge-to-tharles..20201130190846-columns-not-null
--- datamodel.dml
+++ datamodel.dml
@@ -3,21 +3,21 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 model User {
   id                 Int                @id @default(autoincrement())
-  name               String?
-  email              String?            @unique
-  city               String
-  state              String
-  country            String
-  organizationId     Int
-  geeKey             String
-  password           String
+  name               String
+  email              String             @unique
+  city               String?
+  state              String?
+  country            String?
+  organizationId     Int?
+  geeKey             String?
+  password           String?
   typeUserInCampaign TypeUserInCampaign @default(INSPETOR)
   typeUser           TypeUser           @default(USER)
   createdAt          DateTime           @default(now())
   updatedAt          DateTime           @updatedAt
```


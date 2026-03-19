-- Update College table to match schema
-- Add missing columns

-- Add parentId for hierarchical structure
ALTER TABLE "College" ADD COLUMN "parentId" TEXT;
ALTER TABLE "College" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'boshqa';
ALTER TABLE "College" ADD COLUMN "isGovernment" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "College" ADD COLUMN "region" TEXT;
ALTER TABLE "College" ADD COLUMN "district" TEXT;
ALTER TABLE "College" ADD COLUMN "email" TEXT;
ALTER TABLE "College" ADD COLUMN "phone" TEXT;
ALTER TABLE "College" ADD COLUMN "allowSubColleges" BOOLEAN NOT NULL DEFAULT false;

-- Rename old columns to match schema (if needed)
-- Note: adminEmail and adminPhone are being replaced by email and phone

-- Update existing records with default values
UPDATE "College" SET "region" = 'toshkent_sh', "district" = 'chilonzor' WHERE "region" IS NULL;

-- Make subdomain nullable (it's optional in schema)
ALTER TABLE "College" ALTER COLUMN "subdomain" DROP NOT NULL;

-- Add unique constraint on inn if not exists
-- Note: inn was added in previous migration

-- Add self-referencing foreign key for parent-child relationship
ALTER TABLE "College" ADD CONSTRAINT "College_parentId_fkey" 
  FOREIGN KEY ("parentId") REFERENCES "College"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create index on parentId
CREATE INDEX "College_parentId_idx" ON "College"("parentId");

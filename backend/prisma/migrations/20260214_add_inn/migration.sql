-- AlterTable
-- Avval INN maydonini qo'shamiz (nullable)
ALTER TABLE "College" ADD COLUMN "inn" TEXT;

-- Mavjud kollejlarga vaqtincha INN beramiz
UPDATE "College" SET "inn" = '000000000' WHERE "inn" IS NULL;

-- Endi NOT NULL qilamiz
ALTER TABLE "College" ALTER COLUMN "inn" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "College_inn_key" ON "College"("inn");

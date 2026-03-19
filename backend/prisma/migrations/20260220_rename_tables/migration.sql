-- Rename tables to match new schema naming
-- College -> Organization
-- CollegeAdmin -> OrganizationAdmin
-- Student -> Client
-- Group -> Department
-- ParentUser -> ClientUser

-- Rename College to Organization
ALTER TABLE "College" RENAME TO "Organization";

-- Rename CollegeAdmin to OrganizationAdmin
ALTER TABLE "CollegeAdmin" RENAME TO "OrganizationAdmin";

-- Rename Student to Client
ALTER TABLE "Student" RENAME TO "Client";

-- Rename Group to Department
ALTER TABLE "Group" RENAME TO "Department";

-- Rename ParentUser to ClientUser
ALTER TABLE "ParentUser" RENAME TO "ClientUser";

-- Rename indexes for Organization table (PostgreSQL auto-renames some, but we need to fix column names)
-- Note: After table rename, indexes are auto-renamed to Organization_xxx
-- We need to handle unique indexes that reference the old table name

-- Rename indexes for OrganizationAdmin table
ALTER INDEX "CollegeAdmin_email_key" RENAME TO "OrganizationAdmin_email_key";
ALTER INDEX "CollegeAdmin_collegeId_idx" RENAME TO "OrganizationAdmin_organizationId_idx";

-- Rename indexes for Client table
ALTER INDEX "Student_contractNumber_key" RENAME TO "Client_contractNumber_key";
ALTER INDEX "Student_collegeId_idx" RENAME TO "Client_organizationId_idx";
ALTER INDEX "Student_pinfl_idx" RENAME TO "Client_pinfl_idx";
ALTER INDEX "Student_groupId_idx" RENAME TO "Client_departmentId_idx";
ALTER INDEX "Student_collegeId_pinfl_key" RENAME TO "Client_organizationId_pinfl_key";

-- Rename indexes for Department table
-- After table rename from Group to Department, the index is now Department_collegeId_idx
ALTER INDEX "Group_collegeId_idx" RENAME TO "Department_organizationId_idx";

-- Handle the unique index - it was auto-renamed to Department_collegeId_name_year_key
-- First drop it, we'll recreate with correct columns
DROP INDEX IF EXISTS "Department_collegeId_name_year_key";
DROP INDEX IF EXISTS "Group_collegeId_name_year_key";

-- Rename indexes for ClientUser table
ALTER INDEX "ParentUser_phone_key" RENAME TO "ClientUser_phone_key";

-- Rename foreign key constraints
-- OrganizationAdmin
ALTER TABLE "OrganizationAdmin" DROP CONSTRAINT IF EXISTS "CollegeAdmin_collegeId_fkey";
ALTER TABLE "OrganizationAdmin" RENAME COLUMN "collegeId" TO "organizationId";
ALTER TABLE "OrganizationAdmin" ADD CONSTRAINT "OrganizationAdmin_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Client
ALTER TABLE "Client" DROP CONSTRAINT IF EXISTS "Student_collegeId_fkey";
ALTER TABLE "Client" DROP CONSTRAINT IF EXISTS "Student_groupId_fkey";
ALTER TABLE "Client" RENAME COLUMN "collegeId" TO "organizationId";
ALTER TABLE "Client" RENAME COLUMN "groupId" TO "departmentId";
ALTER TABLE "Client" RENAME COLUMN "parentPhone" TO "contactPhone";
ALTER TABLE "Client" RENAME COLUMN "parentName" TO "contactName";
ALTER TABLE "Client" ADD CONSTRAINT "Client_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Client" ADD CONSTRAINT "Client_departmentId_fkey" 
  FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Department
ALTER TABLE "Department" DROP CONSTRAINT IF EXISTS "Group_collegeId_fkey";
ALTER TABLE "Department" RENAME COLUMN "collegeId" TO "organizationId";
ALTER TABLE "Department" ADD CONSTRAINT "Department_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Payment
ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_collegeId_fkey";
ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_studentId_fkey";
ALTER TABLE "Payment" RENAME COLUMN "collegeId" TO "organizationId";
ALTER TABLE "Payment" RENAME COLUMN "studentId" TO "clientId";
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_clientId_fkey" 
  FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Rename Payment indexes
ALTER INDEX "Payment_collegeId_idx" RENAME TO "Payment_organizationId_idx";
ALTER INDEX "Payment_studentId_idx" RENAME TO "Payment_clientId_idx";

-- BankRecord
ALTER TABLE "BankRecord" DROP CONSTRAINT IF EXISTS "BankRecord_collegeId_fkey";
ALTER TABLE "BankRecord" RENAME COLUMN "collegeId" TO "organizationId";
ALTER TABLE "BankRecord" ADD CONSTRAINT "BankRecord_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Rename BankRecord indexes
ALTER INDEX "BankRecord_collegeId_idx" RENAME TO "BankRecord_organizationId_idx";

-- Contract
ALTER TABLE "Contract" DROP CONSTRAINT IF EXISTS "Contract_collegeId_fkey";
ALTER TABLE "Contract" DROP CONSTRAINT IF EXISTS "Contract_studentId_fkey";
ALTER TABLE "Contract" RENAME COLUMN "collegeId" TO "organizationId";
ALTER TABLE "Contract" RENAME COLUMN "studentId" TO "clientId";
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_clientId_fkey" 
  FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Rename Contract indexes
ALTER INDEX "Contract_collegeId_idx" RENAME TO "Contract_organizationId_idx";
ALTER INDEX "Contract_studentId_idx" RENAME TO "Contract_clientId_idx";

-- Reminder
ALTER TABLE "Reminder" DROP CONSTRAINT IF EXISTS "Reminder_collegeId_fkey";
ALTER TABLE "Reminder" RENAME COLUMN "collegeId" TO "organizationId";
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Rename Reminder indexes
ALTER INDEX "Reminder_collegeId_idx" RENAME TO "Reminder_organizationId_idx";

-- Attendance
ALTER TABLE "Attendance" DROP CONSTRAINT IF EXISTS "Attendance_collegeId_fkey";
ALTER TABLE "Attendance" DROP CONSTRAINT IF EXISTS "Attendance_studentId_fkey";
ALTER TABLE "Attendance" RENAME COLUMN "collegeId" TO "organizationId";
ALTER TABLE "Attendance" RENAME COLUMN "studentId" TO "clientId";
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_clientId_fkey" 
  FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Rename Attendance indexes
ALTER INDEX "Attendance_collegeId_idx" RENAME TO "Attendance_organizationId_idx";
ALTER INDEX "Attendance_studentId_idx" RENAME TO "Attendance_clientId_idx";
ALTER INDEX "Attendance_studentId_date_key" RENAME TO "Attendance_clientId_date_key";

-- AuditLog
ALTER INDEX "AuditLog_collegeId_idx" RENAME TO "AuditLog_organizationId_idx";
ALTER TABLE "AuditLog" RENAME COLUMN "collegeId" TO "organizationId";

-- Rename ClientUser children column
ALTER TABLE "ClientUser" RENAME COLUMN "childrenPinfl" TO "linkedClients";

-- CustomDomain (created in previous migration with collegeId)
ALTER TABLE "CustomDomain" DROP CONSTRAINT IF EXISTS "CustomDomain_collegeId_fkey";
ALTER TABLE "CustomDomain" RENAME COLUMN "collegeId" TO "organizationId";
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Rename CustomDomain indexes
ALTER INDEX IF EXISTS "CustomDomain_collegeId_idx" RENAME TO "CustomDomain_organizationId_idx";

-- Add category column to Payment if not exists
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "category" TEXT;

-- Add missing columns to Department (code, description, managerName)
ALTER TABLE "Department" ADD COLUMN IF NOT EXISTS "code" TEXT;
ALTER TABLE "Department" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Department" ADD COLUMN IF NOT EXISTS "managerName" TEXT;

-- Create new unique constraint for Department (organizationId, name)
CREATE UNIQUE INDEX IF NOT EXISTS "Department_organizationId_name_key" ON "Department"("organizationId", "name");

-- Create missing tables that exist in schema but not in database

-- CreateTable: RefreshToken
CREATE TABLE IF NOT EXISTS "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "revokedAt" TIMESTAMP(3),
    "replacedBy" TEXT,
    "deviceInfo" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "RefreshToken_token_key" ON "RefreshToken"("token");
CREATE INDEX IF NOT EXISTS "RefreshToken_userId_idx" ON "RefreshToken"("userId");
CREATE INDEX IF NOT EXISTS "RefreshToken_token_idx" ON "RefreshToken"("token");
CREATE INDEX IF NOT EXISTS "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateTable: LoginHistory
CREATE TABLE IF NOT EXISTS "LoginHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "failureReason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceType" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "country" TEXT,
    "city" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "LoginHistory_userId_idx" ON "LoginHistory"("userId");
CREATE INDEX IF NOT EXISTS "LoginHistory_email_idx" ON "LoginHistory"("email");
CREATE INDEX IF NOT EXISTS "LoginHistory_createdAt_idx" ON "LoginHistory"("createdAt");

-- CreateTable: UserSession
CREATE TABLE IF NOT EXISTS "UserSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "deviceInfo" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserSession_sessionToken_key" ON "UserSession"("sessionToken");
CREATE INDEX IF NOT EXISTS "UserSession_userId_idx" ON "UserSession"("userId");
CREATE INDEX IF NOT EXISTS "UserSession_sessionToken_idx" ON "UserSession"("sessionToken");
CREATE INDEX IF NOT EXISTS "UserSession_expiresAt_idx" ON "UserSession"("expiresAt");

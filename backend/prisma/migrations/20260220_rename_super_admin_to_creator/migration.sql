-- Rename super_admin role to creator in SuperAdmin table
UPDATE "SuperAdmin" SET role = 'creator' WHERE role = 'super_admin';

-- Update RefreshToken userType from super_admin to creator
UPDATE "RefreshToken" SET "userType" = 'creator' WHERE "userType" = 'super_admin';

-- Update LoginHistory userType from super_admin to creator
UPDATE "LoginHistory" SET "userType" = 'creator' WHERE "userType" = 'super_admin';

-- Update UserSession userType from super_admin to creator
UPDATE "UserSession" SET "userType" = 'creator' WHERE "userType" = 'super_admin';

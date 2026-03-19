-- Seed data for EduStatus Monitoring System

-- Super Admin (Creator)
INSERT INTO "SuperAdmin" (id, email, password, "fullName", role, "createdAt", "updatedAt") 
VALUES ('super-admin-001', 'admin@edustatus.uz', '$2b$10$qs/C0QFlENXIYECnfsFPhuRjGMW0RHGDc6xQLUfme6v/1yd3T.c0K', 'Creator', 'creator', NOW(), NOW()) 
ON CONFLICT (email) DO NOTHING;

-- Demo College
INSERT INTO "College" (id, name, subdomain, plan, status, "adminEmail", "adminPhone", address, "studentLimit", "groupLimit", "hasStudents", "hasPayments", "hasReports", "hasBankIntegration", "hasTelegramBot", "hasSmsNotifications", "hasExcelImport", "hasPdfReports", "createdAt", "updatedAt")
VALUES ('college-001', 'Tibbiyot Texnikumi', 'demo', 'pro', 'active', 'admin@tibbiyot.uz', '+998901234567', 'Toshkent shahar, Chilonzor tumani', 500, 20, true, true, true, true, true, true, true, true, NOW(), NOW())
ON CONFLICT (subdomain) DO NOTHING;

-- College Admin
INSERT INTO "CollegeAdmin" (id, "collegeId", email, password, "fullName", role, status, "createdAt", "updatedAt")
VALUES ('college-admin-001', 'college-001', 'admin@tibbiyot.uz', '$2b$10$qs/C0QFlENXIYECnfsFPhuRjGMW0RHGDc6xQLUfme6v/1yd3T.c0K', 'Texnikum Admini', 'admin', 'active', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Groups
INSERT INTO "Group" (id, "collegeId", name, specialty, course, year, "createdAt", "updatedAt") VALUES
('group-001', 'college-001', '101-A', 'Hamshiralik ishi', 1, 2024, NOW(), NOW()),
('group-002', 'college-001', '102-B', 'Farmatsiya', 1, 2024, NOW(), NOW()),
('group-003', 'college-001', '201-A', 'Hamshiralik ishi', 2, 2024, NOW(), NOW()),
('group-004', 'college-001', '202-B', 'Farmatsiya', 2, 2024, NOW(), NOW()),
('group-005', 'college-001', '301-A', 'Hamshiralik ishi', 3, 2024, NOW(), NOW())
ON CONFLICT ("collegeId", name, year) DO NOTHING;

-- Students
INSERT INTO "Student" (id, "collegeId", pinfl, "contractNumber", "fullName", phone, "groupId", "totalAmount", "paidAmount", "debtAmount", status, "createdAt", "updatedAt") VALUES
('student-001', 'college-001', '12345678901234', 'SH-2024-001', 'Aliyev Anvar Abdullaevich', '+998901111111', 'group-001', 12000000, 6000000, 6000000, 'active', NOW(), NOW()),
('student-002', 'college-001', '12345678901235', 'SH-2024-002', 'Valiyeva Dilnoza Karimovna', '+998902222222', 'group-001', 12000000, 12000000, 0, 'active', NOW(), NOW()),
('student-003', 'college-001', '12345678901236', 'SH-2024-003', 'Karimov Bobur Rahimovich', '+998903333333', 'group-002', 10000000, 2500000, 7500000, 'active', NOW(), NOW()),
('student-004', 'college-001', '12345678901237', 'SH-2024-004', 'Najimova Nigora Bahodirovna', '+998904444444', 'group-002', 10000000, 8000000, 2000000, 'active', NOW(), NOW()),
('student-005', 'college-001', '12345678901238', 'SH-2024-005', 'Rahimov Jahongir Toshmatovich', '+998905555555', 'group-003', 12000000, 4000000, 8000000, 'active', NOW(), NOW()),
('student-006', 'college-001', '12345678901239', 'SH-2024-006', 'Sattorova Sevara Alisherovna', '+998906666666', 'group-003', 12000000, 12000000, 0, 'active', NOW(), NOW()),
('student-007', 'college-001', '12345678901240', 'SH-2024-007', 'Toshmatov Temur Ulugbekovich', '+998907777777', 'group-004', 10000000, 5000000, 5000000, 'active', NOW(), NOW()),
('student-008', 'college-001', '12345678901241', 'SH-2024-008', 'Umarova Umida Bahromovna', '+998908888888', 'group-004', 10000000, 10000000, 0, 'active', NOW(), NOW()),
('student-009', 'college-001', '12345678901242', 'SH-2024-009', 'Xolmatov Xurshid Davronovich', '+998909999999', 'group-005', 12000000, 3000000, 9000000, 'active', NOW(), NOW()),
('student-010', 'college-001', '12345678901243', 'SH-2024-010', 'Yuldasheva Yulduz Farhodovna', '+998900000000', 'group-005', 12000000, 9000000, 3000000, 'active', NOW(), NOW())
ON CONFLICT ("contractNumber") DO NOTHING;

-- Payments
INSERT INTO "Payment" (id, "collegeId", "studentId", amount, currency, "paymentMethod", status, "paymentDate", "createdAt", "updatedAt") VALUES
('payment-001', 'college-001', 'student-001', 3000000, 'UZS', 'bank', 'confirmed', '2024-01-15', NOW(), NOW()),
('payment-002', 'college-001', 'student-001', 3000000, 'UZS', 'click', 'confirmed', '2024-02-15', NOW(), NOW()),
('payment-003', 'college-001', 'student-002', 6000000, 'UZS', 'bank', 'confirmed', '2024-01-10', NOW(), NOW()),
('payment-004', 'college-001', 'student-002', 6000000, 'UZS', 'payme', 'confirmed', '2024-02-10', NOW(), NOW()),
('payment-005', 'college-001', 'student-003', 2500000, 'UZS', 'cash', 'confirmed', '2024-01-20', NOW(), NOW()),
('payment-006', 'college-001', 'student-004', 4000000, 'UZS', 'bank', 'pending', '2024-02-20', NOW(), NOW()),
('payment-007', 'college-001', 'student-005', 2000000, 'UZS', 'click', 'confirmed', '2024-01-25', NOW(), NOW()),
('payment-008', 'college-001', 'student-005', 2000000, 'UZS', 'bank', 'pending', '2024-02-25', NOW(), NOW());

-- Mark migration as applied
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, started_at, applied_steps_count)
VALUES ('migration-001', 'seed', NOW(), '20260213183506_init', NOW(), 1)
ON CONFLICT (id) DO NOTHING;

# Security Audit Report - EduStatus/Monitoring

**Audit Date:** 2026-02-20  
**Auditor:** Security Audit System  
**Project:** EduStatus - Educational Institution Management System

---

## Executive Summary

This security audit covers the EduStatus/Monitoring project, a full-stack educational institution management system with a NestJS backend and Next.js frontend. The audit identified **15 security findings** across various categories.

### Risk Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 3 |
| Medium | 5 |
| Low | 7 |

### Overall Security Rating: **MODERATE RISK** ⚠️

The project has a solid security foundation with proper authentication mechanisms, but requires attention to several areas before production deployment.

---

## Detailed Findings

### 1. AUTHENTICATION & AUTHORIZATION

#### ✅ STRENGTHS

1. **Strong Password Hashing** ([`auth.service.ts:9`](backend/src/auth/auth.service.ts:9))
   - Uses bcrypt with 12 rounds (BCRYPT_ROUNDS = 12)
   - Industry standard for secure password storage

2. **JWT Token Management** ([`auth.service.ts:12-13`](backend/src/auth/auth.service.ts:12))
   - Short-lived access tokens (15 minutes)
   - Refresh tokens with 7-day expiry
   - Token rotation on refresh

3. **Session Management** ([`auth.service.ts:14`](backend/src/auth/auth.service.ts:14))
   - Maximum 3 sessions per user
   - Automatic cleanup of old sessions
   - Login history tracking

4. **Login Attempt Logging** ([`auth.service.ts:366-394`](backend/src/auth/auth.service.ts:366))
   - Tracks successful and failed attempts
   - Records IP address, user agent, device type

#### 🔴 HIGH SEVERITY ISSUES

##### Finding #1: Missing Role-Based Access Control (RBAC)

**Location:** [`organizations.controller.ts`](backend/src/organizations/organizations.controller.ts)

**Description:** The organizations controller lacks proper role-based authorization. All endpoints only use `JwtAuthGuard` without checking user roles or organization membership.

```typescript
@Controller('organizations')
@UseGuards(JwtAuthGuard)  // Only checks if authenticated
export class OrganizationsController {
  @Post()
  create(@Body() body: {...}) {
    return this.organizationsService.create(body);  // No role check!
  }
```

**Risk:** Any authenticated user can create organizations, delete organizations, and manage admins regardless of their role.

**Recommendation:** Implement role-based guards:
```typescript
// Create a RolesGuard
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
@Post()
create(...) { ... }
```

##### Finding #2: Missing Organization Authorization

**Location:** [`organizations.controller.ts:46-49`](backend/src/organizations/organizations.controller.ts:46)

**Description:** The `findOne` endpoint allows any authenticated user to view any organization's details without checking if they belong to that organization.

```typescript
@Get(':id')
findOne(@Param('id') id: string) {
  return this.organizationsService.findOne(id);  // No authorization check!
}
```

**Risk:** Information disclosure - users can view details of organizations they don't belong to.

**Recommendation:** Add organization membership verification in the service layer.

##### Finding #3: Tabula Rasa Endpoint Without Authorization

**Location:** [`organizations.controller.ts:171-173`](backend/src/organizations/organizations.controller.ts:171)

**Description:** The `tabulaRasa` endpoint deletes ALL organization data but lacks proper authorization.

```typescript
@Post(':id/tabula-rasa')
tabulaRasa(@Param('id') id: string) {
  return this.organizationsService.tabulaRasa(id);  // Dangerous!
}
```

**Risk:** Any authenticated user can delete all data from any organization.

**Recommendation:** Restrict to super_admin role only and add additional confirmation mechanism.

---

### 2. INPUT VALIDATION & INJECTION PREVENTION

#### ✅ STRENGTHS

1. **SQL Injection Protection** ([`security.middleware.ts:294-302`](backend/src/common/security.middleware.ts:294))
   - Pattern-based SQL injection detection
   - Request body sanitization

2. **XSS Protection** ([`security.middleware.ts:308-320`](backend/src/common/security.middleware.ts:308))
   - HTML entity encoding
   - Recursive body sanitization

3. **Request Size Limit** ([`security.middleware.ts:256-266`](backend/src/common/security.middleware.ts:256))
   - 1MB limit on request body size

4. **Prisma ORM** ([`schema.prisma`](backend/prisma/schema.prisma))
   - Using Prisma ORM prevents SQL injection through parameterized queries

#### 🟡 MEDIUM SEVERITY ISSUES

##### Finding #4: Weak SQL Injection Detection

**Location:** [`security.middleware.ts:294-302`](backend/src/common/security.middleware.ts:294)

**Description:** The SQL injection detection uses simple regex patterns that can be bypassed.

```typescript
private hasSqlInjection(str: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i,
    // ... patterns can be bypassed
  ];
```

**Risk:** Sophisticated SQL injection attacks may bypass detection.

**Recommendation:** Rely on Prisma's parameterized queries and remove custom SQL injection detection, or use a proven library like `sqlmap` detection rules.

##### Finding #5: Missing Input Validation DTOs

**Location:** [`organizations.controller.ts:21-38`](backend/src/organizations/organizations.controller.ts:21)

**Description:** Many endpoints use inline type definitions instead of validated DTOs.

```typescript
@Post()
create(
  @Body() body: {
    name: string;
    inn: string;
    // ... inline type, no validation decorators
  },
)
```

**Risk:** Invalid or malicious data may be processed without proper validation.

**Recommendation:** Create proper DTOs with class-validator decorators:
```typescript
export class CreateOrganizationDto {
  @IsString() @IsNotEmpty() @MaxLength(255)
  name: string;
  
  @IsString() @Matches(/^\d{9}$/)
  inn: string;
  // ...
}
```

---

### 3. FRONTEND SECURITY

#### 🔴 HIGH SEVERITY ISSUES

##### Finding #6: Test Credentials Exposed in UI

**Location:** [`login/page.tsx:108-114`](frontend/src/app/(auth)/login/page.tsx:108)

**Description:** Test credentials are displayed directly in the login page UI.

```typescript
<div className="mt-6 p-4 bg-gray-50 rounded-md">
  <p className="text-sm font-medium mb-2">Test hisoblar:</p>
  <div className="text-xs text-muted-foreground space-y-1">
    <p><strong>Super Admin:</strong> admin@edustatus.uz / admin123</p>
    <p><strong>College Admin:</strong> admin@tibbiyot.uz / admin123</p>
```

**Risk:** Critical - Anyone with access to the login page can see and use these credentials.

**Recommendation:** Remove test credentials from production builds:
```typescript
{process.env.NODE_ENV !== 'production' && (
  <div className="mt-6 p-4 bg-gray-50 rounded-md">
    // Test credentials...
  </div>
)}
```

#### 🟡 MEDIUM SEVERITY ISSUES

##### Finding #7: Sensitive Data in localStorage

**Location:** [`login/page.tsx:31-32`](frontend/src/app/(auth)/login/page.tsx:31)

**Description:** JWT tokens are stored in localStorage which is vulnerable to XSS attacks.

```typescript
localStorage.setItem('token', response.accessToken)
localStorage.setItem('user', JSON.stringify(response.user))
```

**Risk:** If an XSS vulnerability exists, attackers can steal tokens.

**Recommendation:** Use httpOnly cookies for token storage:
```typescript
// Backend should set cookies
res.cookie('accessToken', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});
```

##### Finding #8: Console Logging Sensitive Information

**Location:** Multiple files

**Description:** Sensitive information is logged to console in production code.

```typescript
// login/page.tsx:26-28
console.log('Attempting login with:', username)
console.log('Login response:', response)

// login/page.tsx:38
console.error('Login error:', err)
```

**Risk:** Information leakage through browser console.

**Recommendation:** Remove console.log statements in production or use a logging library that respects environment.

---

### 4. DEPENDENCIES VULNERABILITIES

#### 🟡 MEDIUM SEVERITY ISSUES

##### Finding #9: Outdated Dependencies with Known Vulnerabilities

**Location:** [`package.json`](backend/package.json)

**Description:** npm audit found 10 vulnerabilities (7 moderate, 3 high).

| Package | Severity | Issue |
|---------|----------|-------|
| minimatch | High | ReDoS vulnerability (GHSA-3ppc-4f35-3m26) |
| ajv | Moderate | ReDoS with $data option (GHSA-2g4f-4pwh-qvx6) |
| @nestjs/cli | High | Multiple transitive vulnerabilities |

**Recommendation:** Update dependencies:
```bash
npm update @nestjs/cli
npm audit fix
```

---

### 5. DOCKER & DEPLOYMENT SECURITY

#### ✅ STRENGTHS

1. **Multi-stage Build** ([`Dockerfile:9-96`](backend/Dockerfile:9))
   - Reduces attack surface
   - Smaller final image

2. **Non-root User** ([`Dockerfile:64-66`](backend/Dockerfile:64))
   - Application runs as `appuser` (UID 1001)
   - Follows least privilege principle

3. **Security Options** ([`docker-compose.yml:94-101`](docker-compose.yml:94))
   - `no-new-privileges:true`
   - `cap_drop: ALL`
   - Read-only filesystem

4. **Health Checks** ([`Dockerfile:89-90`](backend/Dockerfile:89))
   - Container health monitoring

5. **Database Security** ([`docker-compose.yml:21-22`](docker-compose.yml:21))
   - PostgreSQL only exposed on localhost
   - scram-sha-256 authentication

#### 🟢 LOW SEVERITY ISSUES

##### Finding #10: Default Secret Key Warning

**Location:** [`jwt.strategy.ts:13`](backend/src/auth/jwt.strategy.ts:13)

**Description:** Fallback to default secret key if JWT_SECRET is not set.

```typescript
const secret = configService.get<string>('JWT_SECRET') || 'default-secret-key';
```

**Risk:** If environment variable is misconfigured, weak default is used.

**Recommendation:** Throw error if JWT_SECRET is not configured:
```typescript
const secret = configService.get<string>('JWT_SECRET');
if (!secret) {
  throw new Error('JWT_SECRET environment variable is required');
}
```

---

### 6. ENVIRONMENT & SECRETS MANAGEMENT

#### ✅ STRENGTHS

1. **Environment Template** ([`.env.example`](.env.example))
   - Clear documentation
   - Warning about not committing .env

2. **Required Variables** ([`docker-compose.yml:15-16`](docker-compose.yml:15))
   - Critical variables marked as required with `${VAR:?error}`

#### 🟢 LOW SEVERITY ISSUES

##### Finding #11: Missing .env in .gitignore Verification

**Location:** [`.gitignore`](.gitignore)

**Description:** Need to verify .env is properly ignored.

**Recommendation:** Ensure .gitignore contains:
```
.env
.env.local
.env.*.local
```

---

### 7. SECURITY HEADERS & CORS

#### ✅ STRENGTHS

1. **Security Headers** ([`security.middleware.ts:137-193`](backend/src/common/security.middleware.ts:137))
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - X-XSS-Protection: 1; mode=block
   - Strict-Transport-Security
   - Content-Security-Policy
   - Referrer-Policy
   - Permissions-Policy

2. **Rate Limiting** ([`security.middleware.ts:20-128`](backend/src/common/security.middleware.ts:20))
   - 100 requests/minute default
   - 5 login attempts/5 minutes
   - 3 password reset attempts/hour

#### 🟢 LOW SEVERITY ISSUES

##### Finding #12: CSP Allows unsafe-inline and unsafe-eval

**Location:** [`security.middleware.ts:157-163`](backend/src/common/security.middleware.ts:157)

**Description:** Content Security Policy allows unsafe-inline and unsafe-eval for scripts.

```typescript
"script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
```

**Risk:** Reduces XSS protection effectiveness.

**Recommendation:** Use nonces or hashes instead:
```typescript
"script-src 'self' 'nonce-{RANDOM}'; " +
```

##### Finding #13: CORS Configuration

**Location:** [`main.ts:9-12`](backend/src/main.ts:9)

**Description:** CORS allows credentials with single origin.

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});
```

**Risk:** Acceptable for development, but should be reviewed for production.

---

### 8. DATABASE SECURITY

#### ✅ STRENGTHS

1. **Prisma ORM** - Prevents SQL injection
2. **Cascade Deletes** ([`schema.prisma:41`](backend/prisma/schema.prisma:41)) - Proper referential integrity
3. **Indexes** ([`schema.prisma:103`](backend/prisma/schema.prisma:103)) - Performance optimization

#### 🟢 LOW SEVERITY ISSUES

##### Finding #14: Missing Field Encryption

**Location:** [`schema.prisma`](backend/prisma/schema.prisma)

**Description:** Sensitive fields like passwords are stored without application-level encryption.

**Risk:** If database is compromised, passwords (though hashed) and other sensitive data are exposed.

**Recommendation:** Consider field-level encryption for highly sensitive data.

##### Finding #15: Audit Log Not Utilized

**Location:** [`schema.prisma:397-414`](backend/prisma/schema.prisma:397)

**Description:** AuditLog model exists but is not being populated by the application.

**Risk:** No audit trail for compliance and forensic analysis.

**Recommendation:** Implement audit logging in the audit interceptor.

---

## Recommendations Summary

### Immediate Actions (Critical/High Priority)

1. **Remove test credentials from login page** (Finding #6)
2. **Implement role-based access control** (Finding #1)
3. **Add organization authorization checks** (Finding #2)
4. **Restrict tabula rasa endpoint** (Finding #3)
5. **Update vulnerable dependencies** (Finding #9)

### Short-term Actions (Medium Priority)

6. **Implement proper DTOs with validation** (Finding #5)
7. **Migrate to httpOnly cookies for tokens** (Finding #7)
8. **Remove console.log statements** (Finding #8)
9. **Improve SQL injection detection** (Finding #4)

### Long-term Actions (Low Priority)

10. **Implement CSP nonces** (Finding #12)
11. **Add field-level encryption** (Finding #14)
12. **Implement audit logging** (Finding #15)
13. **Remove default secret fallback** (Finding #10)

---

## Compliance Considerations

### ISO 27001

- ✅ Access control implemented
- ⚠️ Role-based access needs improvement
- ⚠️ Audit logging not fully implemented
- ✅ Cryptographic controls (bcrypt, JWT)

### PCI DSS

- ⚠️ Not applicable unless handling payment card data directly
- ✅ Secure development practices followed

---

## Conclusion

The EduStatus project demonstrates a good understanding of security fundamentals with proper authentication mechanisms, security headers, and Docker hardening. However, several critical issues need to be addressed before production deployment:

1. **Authorization gaps** - Missing role-based access control
2. **Information disclosure** - Test credentials in UI
3. **Dependency vulnerabilities** - Outdated packages

The security posture can be significantly improved by implementing the recommendations in this report. A follow-up audit is recommended after addressing the high-priority findings.

---

**Report Generated:** 2026-02-20  
**Next Audit Recommended:** After addressing critical findings

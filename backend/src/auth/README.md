# 🔐 Auth Moduli

## 📋 Umumiy Ma'lumot

Auth moduli foydalanuvchilarni autentifikatsiya qilish va JWT token boshqaruvi uchun mas'ul.

## 📁 Fayl Tuzilishi

```
auth/
├── auth.module.ts       # Modul konfiguratsiyasi
├── auth.controller.ts   # API endpointlar
├── auth.service.ts      # Biznes mantiq
├── jwt.strategy.ts      # JWT passport strategiyasi
├── jwt-auth.guard.ts    # Himoya guardi
└── dto/
    └── login.dto.ts     # Login DTO
```

## 🔌 API Endpointlar

| Method | Endpoint | Tavsif | Auth |
|--------|----------|--------|------|
| POST | `/api/auth/login` | Tizimga kirish | ❌ |
| GET | `/api/auth/me` | Joriy foydalanuvchi | ✅ |

## 📝 Kod Tahlili

### auth.service.ts

```typescript
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,     // DB operatsiyalari
    private jwtService: JwtService,    // JWT yaratish
    private configService: ConfigService,
  ) {}

  // Login metodi
  async login(loginDto: LoginDto) {
    // 1. SuperAdmin jadvalida qidirish
    // 2. CollegeAdmin jadvalida qidirish
    // 3. Parolni tekshirish (bcrypt)
    // 4. JWT token yaratish
  }

  // Token yaratish
  private generateToken(userId, email, role, collegeId) {
    // Access token (7 kun)
    // Refresh token (30 kun)
  }
}
```

### jwt.strategy.ts

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  // Token payload ni validate qilish
  async validate(payload: any) {
    return { 
      userId: payload.sub, 
      email: payload.email, 
      role: payload.role,
      collegeId: payload.collegeId 
    };
  }
}
```

### jwt-auth.guard.ts

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Barcha protected endpointlarni himoya qiladi
}
```

## 🔄 Ishlash Jarayoni

```
┌─────────────────────────────────────────────────────────────────┐
│                        LOGIN FLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Foydalanuvchi email va parol kiritadi                       │
│     │                                                            │
│     ▼                                                            │
│  2. SuperAdmin jadvalida email bo'yicha qidirish                │
│     │                                                            │
│     ├─── Topildi ───▶ Parolni tekshirish ───▶ Token yaratish   │
│     │                                                            │
│     └─── Topilmadi                                               │
│           │                                                      │
│           ▼                                                      │
│  3. CollegeAdmin jadvalida email bo'yicha qidirish              │
│     │                                                            │
│     ├─── Topildi ───▶ Parolni tekshirish ───▶ Token yaratish   │
│     │                                                            │
│     └─── Topilmadi ───▶ 401 Unauthorized                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔐 JWT Token Tarkibi

```json
{
  "sub": "clx123...",           // Foydalanuvchi ID
  "email": "admin@example.com", // Email
  "role": "admin",              // Rol
  "collegeId": "clx456...",     // Kollej ID (null for super_admin)
  "iat": 1234567890,            // Issued at
  "exp": 1234567890             // Expiration
}
```

## 👥 Foydalanuvchi Turlari

### SuperAdmin
- Tizim administratori
- Barcha kollejlarni boshqarish huquqi
- `collegeId: null`

### CollegeAdmin
- Kollej administratori
- Faqat o'z kollejini boshqarish huquqi
- Rollar: `admin`, `accountant`, `operator`

## 🛡️ Xavfsizlik

1. **Parol shifrlash:** bcrypt (10 rounds)
2. **Token muddati:** 
   - Access token: 7 kun
   - Refresh token: 30 kun
3. **Token storage:** localStorage (client)

## 📌 Foydalanish

### Controller da Guard ishlatish

```typescript
@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  @Get()
  findAll(@Request() req) {
    // req.user - JWT payload
    const { userId, role, collegeId } = req.user;
  }
}
```

### Frontend da API chaqirish

```typescript
// Login
const { accessToken, user } = await authApi.login(email, password);

// Token ni saqlash
localStorage.setItem('token', accessToken);

// Protected API ga so'rov
fetch('/api/students', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## ⚠️ E'tibor

- Token ni hech kimga bermang
- Parolni hech qachon log qilmang
- Production da JWT_SECRET ni o'zgartiring

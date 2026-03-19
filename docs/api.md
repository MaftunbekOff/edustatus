# 📚 API Hujjatlari

## 🔐 Autentifikatsiya

Barcha API so'rovlar (login dan tashqari) `Authorization` headerida JWT token talab qiladi:

```
Authorization: Bearer <token>
```

---

## 📡 API Endpointlar

### Auth

| Method | Endpoint | Tavsif | Auth |
|--------|----------|--------|------|
| POST | `/api/auth/login` | Tizimga kirish | ❌ |
| GET | `/api/auth/me` | Joriy foydalanuvchi | ✅ |

#### POST /api/auth/login

**Request:**
```json
{
  "username": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "clx123...",
    "email": "admin@example.com",
    "fullName": "Admin User",
    "role": "admin",
    "collegeId": "clx456..."
  }
}
```

---

### Students

| Method | Endpoint | Tavsif | Auth |
|--------|----------|--------|------|
| GET | `/api/students` | Talabalar ro'yxati | ✅ |
| POST | `/api/students` | Yangi talaba | ✅ |
| GET | `/api/students/:id` | Bitta talaba | ✅ |
| PATCH | `/api/students/:id` | Talabani yangilash | ✅ |
| DELETE | `/api/students/:id` | Talabani o'chirish | ✅ |
| GET | `/api/students/duplicates` | Takroriy talabalar | ✅ |
| GET | `/api/students/debtors` | Qarzdor talabalar | ✅ |

#### GET /api/students

**Query Parameters:**
| Param | Turi | Tavsif |
|-------|------|--------|
| collegeId | string | Kollej ID (majburiy) |
| search | string | Qidirish (ism, PINFL, shartnoma) |
| groupId | string | Guruh bo'yicha filter |
| status | string | Status filter (active, graduated, expelled) |

**Response:**
```json
[
  {
    "id": "clx123...",
    "fullName": "Aliyev Vali",
    "pinfl": "12345678901234",
    "contractNumber": "SH-2024-001",
    "groupId": "clx456...",
    "group": {
      "id": "clx456...",
      "name": "Guruh-101",
      "specialty": "Axborot texnologiyalari"
    },
    "phone": "+998901234567",
    "email": "aliyev@example.com",
    "totalAmount": 5000000,
    "paidAmount": 2000000,
    "debtAmount": 3000000,
    "status": "active",
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

#### POST /api/students

**Request:**
```json
{
  "fullName": "Aliyev Vali",
  "pinfl": "12345678901234",
  "contractNumber": "SH-2024-001",
  "groupId": "clx456...",
  "phone": "+998901234567",
  "email": "aliyev@example.com",
  "totalAmount": 5000000,
  "paidAmount": 0
}
```

---

### Payments

| Method | Endpoint | Tavsif | Auth |
|--------|----------|--------|------|
| GET | `/api/payments` | To'lovlar ro'yxati | ✅ |
| POST | `/api/payments` | Yangi to'lov | ✅ |
| GET | `/api/payments/:id` | Bitta to'lov | ✅ |
| POST | `/api/payments/:id/confirm` | To'lovni tasdiqlash | ✅ |
| POST | `/api/payments/:id/reject` | To'lovni rad etish | ✅ |
| GET | `/api/payments/stats` | To'lovlar statistikasi | ✅ |

#### GET /api/payments

**Query Parameters:**
| Param | Turi | Tavsif |
|-------|------|--------|
| collegeId | string | Kollej ID (majburiy) |
| studentId | string | Talaba bo'yicha filter |
| status | string | Status filter |
| dateFrom | string | Boshlanish sanasi |
| dateTo | string | Tugash sanasi |

**Response:**
```json
[
  {
    "id": "clx789...",
    "studentId": "clx123...",
    "student": {
      "id": "clx123...",
      "fullName": "Aliyev Vali"
    },
    "amount": 500000,
    "currency": "UZS",
    "paymentMethod": "bank",
    "status": "confirmed",
    "paymentDate": "2024-01-20T00:00:00Z",
    "confirmedAt": "2024-01-20T14:30:00Z",
    "description": "Yanvar oyi to'lovi"
  }
]
```

#### POST /api/payments

**Request:**
```json
{
  "studentId": "clx123...",
  "amount": 500000,
  "paymentMethod": "bank",
  "paymentDate": "2024-01-20",
  "description": "Yanvar oyi to'lovi"
}
```

---

### Groups

| Method | Endpoint | Tavsif | Auth |
|--------|----------|--------|------|
| GET | `/api/groups` | Guruhlar ro'yxati | ✅ |
| POST | `/api/groups` | Yangi guruh | ✅ |
| GET | `/api/groups/:id` | Bitta guruh | ✅ |
| PATCH | `/api/groups/:id` | Guruhni yangilash | ✅ |
| DELETE | `/api/groups/:id` | Guruhni o'chirish | ✅ |

#### GET /api/groups

**Query Parameters:**
| Param | Turi | Tavsif |
|-------|------|--------|
| collegeId | string | Kollej ID (majburiy) |

**Response:**
```json
[
  {
    "id": "clx456...",
    "name": "Guruh-101",
    "specialty": "Axborot texnologiyalari",
    "course": 1,
    "year": 2024,
    "_count": {
      "students": 25
    }
  }
]
```

---

### Colleges (Super Admin)

| Method | Endpoint | Tavsif | Auth |
|--------|----------|--------|------|
| GET | `/api/colleges` | Kollejar ro'yxati | ✅ (super_admin) |
| POST | `/api/colleges` | Yangi kollej | ✅ (super_admin) |
| GET | `/api/colleges/:id` | Bitta kollej | ✅ (super_admin) |
| PATCH | `/api/colleges/:id` | Kollejni yangilash | ✅ (super_admin) |
| DELETE | `/api/colleges/:id` | Kollejni o'chirish | ✅ (super_admin) |
| GET | `/api/colleges/:id/stats` | Kollej statistikasi | ✅ (super_admin) |

#### GET /api/colleges

**Response:**
```json
[
  {
    "id": "clx789...",
    "name": "Toshkent Axborot Texnologiyalari Kolleji",
    "subdomain": "tatk",
    "customDomain": "tatk.uz",
    "plan": "pro",
    "status": "active",
    "adminEmail": "admin@tatk.uz",
    "_count": {
      "students": 450,
      "groups": 18
    }
  }
]
```

---

### Dashboard

| Method | Endpoint | Tavsif | Auth |
|--------|----------|--------|------|
| GET | `/api/dashboard/stats` | Kollej statistikasi | ✅ |
| GET | `/api/dashboard/super-admin` | Super Admin statistikasi | ✅ (super_admin) |

#### GET /api/dashboard/stats

**Query Parameters:**
| Param | Turi | Tavsif |
|-------|------|--------|
| collegeId | string | Kollej ID |

**Response:**
```json
{
  "todayPayments": 5000000,
  "todayCount": 12,
  "monthlyPayments": 150000000,
  "monthlyPlan": 200000000,
  "monthlyPercent": 75,
  "totalStudents": 450,
  "activeStudents": 420,
  "totalDebt": 25000000,
  "recentPayments": [...],
  "groupDebts": [
    {
      "groupId": "clx456...",
      "groupName": "Guruh-101",
      "totalDebt": 5000000,
      "studentCount": 5
    }
  ]
}
```

---

## ❌ Xatolik Kodlari

| Kod | Tavsif |
|-----|--------|
| 400 | Noto'g'ri so'rov ma'lumotlari |
| 401 | Autentifikatsiya talab qilinadi |
| 403 | Ruxsat yo'q |
| 404 | Resurs topilmadi |
| 409 | Ma'lumot allaqachon mavjud |
| 500 | Server xatosi |

**Xatolik formati:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

---

## 🔄 Rollar va Huquqlar

| Endpoint | super_admin | admin | accountant | operator |
|----------|-------------|-------|------------|----------|
| `/api/colleges/*` | ✅ | ❌ | ❌ | ❌ |
| `/api/students/*` | ✅ | ✅ | ✅ | ✅ |
| `/api/payments/confirm` | ✅ | ✅ | ✅ | ❌ |
| `/api/payments/create` | ✅ | ✅ | ✅ | ✅ |
| `/api/dashboard/*` | ✅ | ✅ | ✅ | ✅ |

---

## 📝 So'rov Namunalari

### cURL

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@example.com","password":"password123"}'

# Get students
curl -X GET "http://localhost:3001/api/students?collegeId=clx123" \
  -H "Authorization: Bearer <token>"

# Create payment
curl -X POST http://localhost:3001/api/payments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"studentId":"clx456","amount":500000,"paymentMethod":"bank","paymentDate":"2024-01-20"}'
```

### JavaScript (fetch)

```javascript
// Login
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin@example.com', password: 'password123' })
})
const { accessToken, user } = await response.json()

// Get students
const students = await fetch('http://localhost:3001/api/students?collegeId=clx123', {
  headers: { Authorization: `Bearer ${accessToken}` }
}).then(r => r.json())
```

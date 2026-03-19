# 🔒 ISO 27001 va PCI DSS Talablari

## 📋 Umumiy Ma'lumot

Bu hujjat Monitoring tizimi uchun ISO 27001 (Axborot Xavfsizligi Boshqaruvi) va PCI DSS (To'lov Kartalari Ma'lumotlari Xavfsizligi) sertifikatlarini olish uchun zarur bo'lgan talablarni o'z ichiga oladi.

---

## 🏛️ ISO 27001 - Axborot Xavfsizligi Boshqaruvi Tizimi

### 1. Tashkiliy Xavfsizlik (A.6)

#### 1.1 Xavfsizlik Siyosati
| Talab | Holat | Tavsif |
|-------|-------|--------|
| Xavfsizlik siyosati hujjati | ✅ | [`security-policy.md`](./security-policy.md) |
| Siyosatni tasdiqlash | ⏳ | Rahbar tomonidan imzolanishi kerak |
| Siyosatni e'lon qilish | ⏳ | Barcha xodimlarga yetkazilishi kerak |
| Siyosatni ko'rib chiqish | ⏳ | Har yili yangilanishi kerak |

#### 1.2 Xavfsizlik Tashkiloti
| Talab | Holat | Tavsif |
|-------|-------|--------|
| Xavfsizlik bo'limi | ⏳ | Xavfsizlik mas'ul xodimi tayinlash |
| Rollar va mas'uliyat | ✅ | [`roles-responsibilities.md`](./roles-responsibilities.md) |
| Manfaatlar to'qnashuvi | ⏳ | Ajratish siyosati |

#### 1.3 Inson Resurslari Xavfsizligi
| Talab | Holat | Tavsif |
|-------|-------|--------|
| Xodimlarni tekshirish | ⏳ | Ishga qabul qilishda |
| Xavfsizlik o'qitish | ⏳ | Har 6 oyda |
| Intizomiy choralar | ⏳ | Xavfsizlik buzilishida |

### 2. Aktivlar Boshqaruvi (A.8)

#### 2.1 Aktivlar Ro'yxati
| Talab | Holat | Tavsif |
|-------|-------|--------|
| Ma'lumotlar aktivlari | ✅ | [`assets-inventory.md`](./assets-inventory.md) |
| Uskunalar ro'yxati | ⏳ | Serverlar, kompyuterlar |
| Dasturiy ta'minot | ⏳ | Litsenziyalar |

#### 2.2 Ma'lumotlar Tasnifi
| Daraja | Tavsif | Misol |
|--------|--------|-------|
| **Maxfiy** | Juda yuqori xavf | Parollar, shifrlangan ma'lumotlar |
| **Ichki** | Ichki foydalanish | Talaba ma'lumotlari, to'lovlar |
| **Ochiq** | Ommaviy | Kollej nomi, manzili |

### 3. Kirish Nazorati (A.9)

#### 3.1 Foydalanuvchi Kirish Boshqaruvi
| Talab | Holat | Amal |
|-------|-------|------|
| Ro'yxatdan o'tish | ✅ | Auth moduli |
| Parol siyosati | ⏳ | Kuchaytirish kerak |
| Hisob qulflash | ⏳ | 5 ta noto'g'ri urinishdan keyin |
| Sessiya muddati | ⏳ | 30 daqiqa nofaollikdan keyin |

#### 3.2 Foydalanuvchi Huquqlari
| Talab | Holat | Amal |
|-------|-------|------|
| Rol asosida kirish | ✅ | RBAC implementatsiya qilingan |
| Privilegiyalarni ajratish | ✅ | admin, accountant, operator |
| Super admin cheklovi | ✅ | Alohida hisob |

### 4. Kriptografiya (A.10)

#### 4.1 Shifrlash Talablari
| Ma'lumot turi | Algoritm | Holat |
|---------------|----------|-------|
| Parollar | bcrypt (10 rounds) | ✅ |
| JWT Token | HS256 | ✅ |
| HTTPS | TLS 1.2+ | ⏳ |
| Ma'lumotlar bazasi | PostgreSQL | ⏳ |

#### 4.2 Kalit Boshqaruvi
| Talab | Holat | Amal |
|-------|-------|------|
| JWT Secret | ⏳ | Kamida 256 bit |
| Kalitlarni aylantirish | ⏳ | Har 90 kunda |
| HSM yoki KMS | ⏳ | Production uchun |

### 5. Jismoniy Xavfsizlik (A.11)

| Talab | Holat | Tavsif |
|-------|-------|--------|
| Server xonasi | ⏳ | Kirish nazorati |
| CCTV | ⏳ | 24/7 yozib olish |
| Yong'in xavfsizligi | ⏳ | Signalizatsiya |
| Buxgalteriya | ⏳ | Cheklangan kirish |

### 6. Operatsion Xavfsizlik (A.12)

#### 6.1 Ma'lumotlarni Zaxiralash
| Talab | Holat | Amal |
|-------|-------|------|
| Kunlik zaxira | ⏳ | Avtomatik |
| Offsite zaxira | ⏳ | Boshqa joyda |
| Zaxirani sinash | ⏳ | Har oy |

#### 6.2 Log Boshqaruvi
| Talab | Holat | Amal |
|-------|-------|------|
| Audit log | ✅ | AuditLog modeli mavjud |
| Log saqlash | ⏳ | 1 yil |
| Log himoyasi | ⏳ | O'zgartirib bo'lmaydigan |

### 7. Aloqa Xavfsizligi (A.13)

| Talab | Holat | Amal |
|-------|-------|------|
| HTTPS | ⏳ | SSL sertifikat |
| API autentifikatsiya | ✅ | JWT token |
| Rate limiting | ⏳ | DDoS himoyasi |
| Firewall | ⏳ | Port cheklovlari |

### 8. Tizim Qabul Qilish (A.14)

| Talab | Holat | Amal |
|-------|-------|------|
| Xavfsizlik talablari | ⏳ | SDLC ga qo'shish |
| Penetration test | ⏳ | Har yili |
| Vulnerability scan | ⏳ | Har oy |

### 9. Buzilish Boshqaruvi (A.16)

| Talab | Holat | Amal |
|-------|-------|------|
| Buzilish protsedurasi | ⏳ | Incident response plan |
| Xabardor qilish | ⏳ | 72 soat ichida |
| Tergov | ⏳ | Root cause analysis |

---

## 💳 PCI DSS - To'lov Kartalari Ma'lumotlari Xavfsizligi

### 1. Tarmoq Xavfsizligi (Requirement 1)

| Talab | Holat | Amal |
|-------|-------|------|
| Firewall | ⏳ | Tarmoq chegarasida |
| DMZ | ⏳ | Web server uchun |
| Port cheklovlari | ⏳ | Faqat kerakli portlar |
| Router konfiguratsiya | ⏳ | ACL qoidalari |

### 2. Standart Parollar (Requirement 2)

| Talab | Holat | Amal |
|-------|-------|------|
| Default parollarni o'zgartirish | ✅ | Barcha tizimlarda |
| SSH kalitlari | ⏳ | Parolsiz kirish |
| Service account | ⏳ | Maxsus parollar |

### 3. Karta Ma'lumotlarini Himoyalash (Requirement 3)

#### 3.1 Saqlash Talablari
| Ma'lumot | Saqlash | Ko'rsatish |
|----------|---------|------------|
| PAN (Karta raqami) | ❌ | Saqlanmaydi |
| CVV/CVC | ❌ | Saqlanmaydi |
| PIN | ❌ | Saqlanmaydi |
| Karta egasi ismi | ✅ | Saqlanadi |

> ⚠️ **Muhim:** Tizim to'lov kartalari ma'lumotlarini SAQLAMAYDI. To'lovlar Click/Payme orqali amalga oshiriladi.

#### 3.2 Tokenizatsiya
| Talab | Holat | Amal |
|-------|-------|------|
| Token ishlatish | ⏳ | Click/Payme token |
| Token-PAN aloqasi | ⏳ | Xavfsiz saqlash |

### 4. Uzatishda Shifrlash (Requirement 4)

| Talab | Holat | Amal |
|-------|-------|------|
| TLS 1.2+ | ⏳ | Barcha aloqalarda |
| SSL/TLS sertifikat | ⏳ | Trusted CA |
| HSTS | ⏳ | HTTP Strict Transport Security |

### 5. Antivirus Dasturi (Requirement 5)

| Talab | Holat | Amal |
|-------|-------|------|
| Antivirus | ⏳ | Serverlarda |
| Avtomatik yangilanish | ⏳ | Har kuni |
| Muntazam skaner | ⏳ | Har hafta |

### 6. Xavfsiz Tizimlar (Requirement 6)

| Talab | Holat | Amal |
|-------|-------|------|
| Security patches | ⏳ | 30 kun ichida |
| OWASP Top 10 | ⏳ | Himoya choralar |
| Code review | ⏳ | Har bir PR da |

### 7. Kirish Cheklovi (Requirement 7)

| Talab | Holat | Amal |
|-------|-------|------|
| Need-to-know | ✅ | RBAC |
| Default deny | ⏳ | Barcha resurslar |
| Privileged access | ⏳ | PAM yechimi |

### 8. Identifikatsiya va Autentifikatsiya (Requirement 8)

| Talab | Holat | Amal |
|-------|-------|------|
| Unikal foydalanuvchi ID | ✅ | Har bir foydalanuvchi |
| Ikki faktorli auth | ⏳ | Admin uchun |
| Parol siyosati | ⏳ | Kuchaytirish |
| Sessiya timeout | ⏳ | 15 daqiqa |

### 9. Jismoniy Kirish Cheklovi (Requirement 9)

| Talab | Holat | Amal |
|-------|-------|------|
| Server xonasi | ⏳ | Kartali kirish |
| Visitor log | ⏳ | Tashrif buyuruvchilar |
| Media destruction | ⏳ | Ma'lumotlarni o'chirish |

### 10. Remote Access (Requirement 12)

| Talab | Holat | Amal |
|-------|-------|------|
| VPN | ⏳ | Masofaviy kirish |
| MFA | ⏳ | VPN uchun |
| Session recording | ⏳ | Admin harakatlar |

---

## 📊 Compliance Checklist

### ISO 27001

| Bo'lim | Talablar | Bajarilgan | Foiz |
|--------|----------|------------|------|
| A.5 Siyosat | 2 | 1 | 50% |
| A.6 Tashkilot | 6 | 2 | 33% |
| A.7 Inson resurslari | 6 | 1 | 17% |
| A.8 Aktivlar | 10 | 3 | 30% |
| A.9 Kirish | 9 | 4 | 44% |
| A.10 Kriptografiya | 6 | 2 | 33% |
| A.11 Jismoniy | 8 | 0 | 0% |
| A.12 Operatsion | 12 | 2 | 17% |
| A.13 Aloqa | 7 | 2 | 29% |
| A.14 Qabul | 5 | 0 | 0% |
| A.16 Buzilish | 7 | 0 | 0% |
| **JAMI** | **78** | **17** | **22%** |

### PCI DSS

| Talab | Bajarilgan | Foiz |
|-------|------------|------|
| Req 1: Tarmoq | 1/8 | 12% |
| Req 2: Parollar | 1/5 | 20% |
| Req 3: Karta ma'lumotlari | 4/6 | 67% |
| Req 4: Shifrlash | 0/4 | 0% |
| Req 5: Antivirus | 0/4 | 0% |
| Req 6: Tizimlar | 1/6 | 17% |
| Req 7: Kirish | 2/4 | 50% |
| Req 8: Auth | 2/8 | 25% |
| Req 9: Jismoniy | 0/5 | 0% |
| Req 12: Remote | 0/4 | 0% |
| **JAMI** | **11/54** | **20%** |

---

## 🎯 Keyingi Qadamlar

### 1. Birinchi Ustuvorlik (1-3 oy)
- [ ] Xavfsizlik siyosati hujjatlarini tayyorlash
- [ ] HTTPS va SSL sertifikat o'rnatish
- [ ] Parol siyosatini kuchaytirish
- [ ] Audit log ni to'liq sozlash
- [ ] Firewall va tarmoq xavfsizligi

### 2. Ikkinchi Ustuvorlik (3-6 oy)
- [ ] Ikki faktorli autentifikatsiya
- [ ] Penetration test o'tkazish
- [ ] Xodimlarni o'qitish
- [ ] Backup va disaster recovery
- [ ] Incident response plan

### 3. Uchinchi Ustuvorlik (6-12 oy)
- [ ] ISO 27001 sertifikatsiya
- [ ] PCI DSS assessment
- [ ] External audit
- [ ] Continuous monitoring

---

## 📞 Aloqa

Xavfsizlik masalalari bo'yicha:
- Email: security@example.com
- Phone: +998 XX XXX XX XX

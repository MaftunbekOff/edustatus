# ✅ Xavfsizlik Tekshiruvi Checklist

## 📋 Hujjat Ma'lumotlari

| Maydon | Qiymat |
|--------|--------|
| Hujjat nomi | Security Checklist |
| Versiya | 1.0 |
| Sana | 2024-01-20 |
| Tekshiruvchi | [Ism] |

---

## 1. Autentifikatsiya va Avtorizatsiya

### 1.1 Parol Siyosati

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 1.1.1 | Parol kamida 12 ta belgidan iborat | ⬜ | |
| 1.1.2 | Katta harf majburiy | ⬜ | |
| 1.1.3 | Kichik harf majburiy | ⬜ | |
| 1.1.4 | Raqam majburiy | ⬜ | |
| 1.1.5 | Maxsus belgi majburiy | ⬜ | |
| 1.1.6 | Parol tarixi (oxirgi 5 ta) | ⬜ | |
| 1.1.7 | Parol muddati 90 kun | ⬜ | |
| 1.1.8 | Bcrypt shifrlash (10+ rounds) | ✅ | bcrypt ishlatilmoqda |

### 1.2 Hisob Qulflash

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 1.2.1 | 5 ta noto'g'ri urinishdan keyin qulflash | ⬜ | |
| 1.2.2 | Qulflash muddati 15 daqiqa | ⬜ | |
| 1.2.3 | Administratorga xabar berish | ⬜ | |
| 1.2.4 | IP manzilni log qilish | ⬜ | |

### 1.3 Sessiya Boshqaruvi

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 1.3.1 | Sessiya muddati 8 soat | ⬜ | |
| 1.3.2 | Noaktivlik timeout 30 daqiqa | ⬜ | |
| 1.3.3 | Bir vaqtda faqat 1 sessiya | ⬜ | |
| 1.3.4 | Sessiya token yangilash | ⬜ | |
| 1.3.5 | Logout da token bekor qilish | ⬜ | |

### 1.4 Ikki Faktorli Autentifikatsiya

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 1.4.1 | Super Admin uchun 2FA | ⬜ | |
| 1.4.2 | Admin uchun 2FA | ⬜ | |
| 1.4.3 | TOTP qo'llab-quvvatlash | ⬜ | |
| 1.4.4 | SMS backup | ⬜ | |

### 1.5 Rol Asosida Kirish (RBAC)

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 1.5.1 | Rollar aniq belgilangan | ✅ | super_admin, admin, accountant, operator |
| 1.5.2 | Har bir rol uchun huquqlar ro'yxati | ✅ | |
| 1.5.3 | API endpoint himoyasi | ✅ | JwtAuthGuard |
| 1.5.4 | Frontend route himoyasi | ✅ | AuthContext |

---

## 2. Ma'lumotlar Himoyasi

### 2.1 Shifrlash

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 2.1.1 | Parollar bcrypt bilan shifrlangan | ✅ | |
| 2.1.2 | JWT token HS256/RS256 | ✅ | HS256 |
| 2.1.3 | HTTPS majburiy | ⬜ | SSL sertifikat kerak |
| 2.1.4 | Database ulanish SSL | ⬜ | |
| 2.1.5 | JWT Secret kamida 256 bit | ⬜ | |
| 2.1.6 | Kalitlarni aylantirish (90 kun) | ⬜ | |

### 2.2 Ma'lumotlar Tasnifi

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 2.2.1 | Ma'lumotlar tasnifi hujjati | ✅ | security-policy.md |
| 2.2.2 | Tasnif bo'yicha himoya choralar | ✅ | |
| 2.2.3 | Maxfiy ma'lumotlarni belgilash | ⬜ | |

### 2.3 Ma'lumotlarni Saqlash

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 2.3.1 | Karta ma'lumotlari saqlanmaydi | ✅ | Click/Payme orqali |
| 2.3.2 | CVV/CVC saqlanmaydi | ✅ | |
| 2.3.3 | PIN saqlanmaydi | ✅ | |
| 2.3.4 | Shifrlangan ma'lumotlar ajratilgan | ⬜ | |

### 2.4 Ma'lumotlarni O'chirish

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 2.4.1 | Soft delete ishlatilgan | ✅ | |
| 2.4.2 | Hard delete log bilan | ⬜ | |
| 2.4.3 | Ma'lumotlarni qayta tiklash imkoni | ⬜ | |

---

## 3. Tarmoq Xavfsizligi

### 3.1 Firewall

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 3.1.1 | Firewall o'rnatilgan | ⬜ | |
| 3.1.2 | Keraksiz portlar yopiq | ⬜ | |
| 3.1.3 | DMZ konfiguratsiya | ⬜ | |
| 3.1.4 | ACL qoidalari | ⬜ | |

### 3.2 DDoS Himoyasi

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 3.2.1 | Rate limiting | ✅ | RateLimitMiddleware |
| 3.2.2 | IP bloklash | ✅ | |
| 3.2.3 | Cloudflare yoki CDN | ⬜ | |
| 3.2.4 | Traffic monitoring | ⬜ | |

### 3.3 HTTPS va SSL

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 3.3.1 | SSL sertifikat o'rnatilgan | ⬜ | |
| 3.3.2 | TLS 1.2+ majburiy | ⬜ | |
| 3.3.3 | HTTP dan HTTPS redirect | ⬜ | |
| 3.3.4 | HSTS header | ✅ | SecurityHeadersMiddleware |

---

## 4. Dasturiy Ta'minot Xavfsizligi

### 4.1 Input Validation

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 4.1.1 | DTO validatsiya | ✅ | class-validator |
| 4.1.2 | SQL injection himoyasi | ✅ | Prisma ORM |
| 4.1.3 | XSS himoyasi | ✅ | React + sanitizatsiya |
| 4.1.4 | CSRF himoyasi | ⬜ | |
| 4.1.5 | File upload validatsiya | ⬜ | |

### 4.2 Output Encoding

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 4.2.1 | HTML encoding | ✅ | React avtomatik |
| 4.2.2 | JSON encoding | ✅ | |
| 4.2.3 | URL encoding | ✅ | |

### 4.3 Security Headers

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 4.3.1 | X-Content-Type-Options | ✅ | nosniff |
| 4.3.2 | X-Frame-Options | ✅ | DENY |
| 4.3.3 | X-XSS-Protection | ✅ | 1; mode=block |
| 4.3.4 | Content-Security-Policy | ✅ | |
| 4.3.5 | Referrer-Policy | ✅ | |
| 4.3.6 | Permissions-Policy | ✅ | |

### 4.4 Dependency Management

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 4.4.1 | npm audit muntazam | ⬜ | |
| 4.4.2 | Vulnerable package yangilash | ⬜ | |
| 4.4.3 | Dependency lock file | ✅ | package-lock.json |
| 4.4.4 | Minimal dependencies | ✅ | |

---

## 5. Audit va Monitoring

### 5.1 Audit Log

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 5.1.1 | Barcha CRUD operatsiyalar log qilinadi | ✅ | AuditLog model |
| 5.1.2 | Login/logout log | ⬜ | |
| 5.1.3 | IP manzil saqlanadi | ✅ | |
| 5.1.4 | User agent saqlanadi | ✅ | |
| 5.1.5 | Log o'zgartirib bo'lmaydi | ⬜ | |
| 5.1.6 | Log saqlash muddati 1 yil | ⬜ | |

### 5.2 Monitoring

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 5.2.1 | Server health monitoring | ⬜ | |
| 5.2.2 | API response time | ⬜ | |
| 5.2.3 | Error rate monitoring | ⬜ | |
| 5.2.4 | Alerting system | ⬜ | |

### 5.3 Log Protection

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 5.3.1 | Log fayllar shifrlangan | ⬜ | |
| 5.3.2 | Log fayllar ajratilgan serverda | ⬜ | |
| 5.3.3 | Log access control | ⬜ | |

---

## 6. Backup va Disaster Recovery

### 6.1 Backup

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 6.1.1 | Kunlik backup | ⬜ | |
| 6.1.2 | Offsite backup | ⬜ | |
| 6.1.3 | Backup encryption | ⬜ | |
| 6.1.4 | Backup testing | ⬜ | |

### 6.2 Disaster Recovery

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 6.2.1 | DR plan hujjati | ⬜ | |
| 6.2.2 | RTO 4 soat | ⬜ | |
| 6.2.3 | RPO 1 soat | ⬜ | |
| 6.2.4 | DR test har yili | ⬜ | |

---

## 7. Jismoniy Xavfsizlik

### 7.1 Server Xonasi

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 7.1.1 | Kartali kirish | ⬜ | |
| 7.1.2 | CCTV 24/7 | ⬜ | |
| 7.1.3 | Visitor log | ⬜ | |
| 7.1.4 | Yong'in signalizatsiyasi | ⬜ | |

### 7.2 Uskunalar

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 7.2.1 | UPS | ⬜ | |
| 7.2.2 | Generator | ⬜ | |
| 7.2.3 | HVAC | ⬜ | |

---

## 8. Xodimlar Xavfsizligi

### 8.1 Ishga Qabul

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 8.1.1 | CV tekshirish | ⬜ | |
| 8.1.2 | Reference check | ⬜ | |
| 8.1.3 | Background check | ⬜ | |
| 8.1.4 | NDA imzolash | ⬜ | |

### 8.2 O'qitish

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 8.2.1 | Kirish o'qitish | ⬜ | |
| 8.2.2 | Parol xavfsizligi o'qitish | ⬜ | |
| 8.2.3 | Phishing o'qitish | ⬜ | |
| 8.2.4 | Yillik refresher | ⬜ | |

### 8.3 Ishdan Bo'shash

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 8.3.1 | Hisob o'chirish 1 kun ichida | ⬜ | |
| 8.3.2 | Kirish huquqlarini olib tashlash | ⬜ | |
| 8.3.3 | Uskunalarni qaytarish | ⬜ | |
| 8.3.4 | Exit interview | ⬜ | |

---

## 9. Uchinchi Tomon

### 9.1 Vendor Assessment

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 9.1.1 | Click/Payme security assessment | ⬜ | |
| 9.1.2 | Cloud provider assessment | ⬜ | |
| 9.1.3 | Vendor security questionnaire | ⬜ | |

### 9.2 Contracts

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 9.2.1 | Security clauses in contracts | ⬜ | |
| 9.2.2 | SLA agreements | ⬜ | |
| 9.2.3 | Data processing agreement | ⬜ | |

---

## 10. Compliance

### 10.1 ISO 27001

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 10.1.1 | ISMS documentation | ✅ | security-policy.md |
| 10.1.2 | Risk assessment | ⬜ | |
| 10.1.3 | Statement of Applicability | ⬜ | |
| 10.1.4 | Internal audit | ⬜ | |
| 10.1.5 | Management review | ⬜ | |

### 10.2 PCI DSS

| # | Talab | Holat | Izoh |
|---|-------|-------|------|
| 10.2.1 | SAQ completion | ⬜ | |
| 10.2.2 | ASV scan | ⬜ | |
| 10.2.3 | Penetration test | ⬜ | |
| 10.2.4 | QSA assessment (if required) | ⬜ | |

---

## 📊 Umumiy Natija

| Bo'lim | Jami | Bajarilgan | Foiz |
|--------|------|------------|------|
| 1. Auth | 21 | 8 | 38% |
| 2. Data | 16 | 6 | 38% |
| 3. Network | 12 | 3 | 25% |
| 4. Software | 17 | 10 | 59% |
| 5. Audit | 12 | 4 | 33% |
| 6. Backup | 8 | 0 | 0% |
| 7. Physical | 8 | 0 | 0% |
| 8. Personnel | 12 | 0 | 0% |
| 9. Third Party | 6 | 0 | 0% |
| 10. Compliance | 9 | 1 | 11% |
| **JAMI** | **121** | **32** | **26%** |

---

## 🎯 Ustuvor Choralar

### Birinchi Ustuvorlik (1 oy)
1. [ ] SSL sertifikat o'rnatish
2. [ ] Parol siyosatini kuchaytirish
3. [ ] Hisob qulflash mexanizmi
4. [ ] Backup sozlash

### Ikkinchi Ustuvorlik (3 oy)
1. [ ] 2FA joriy qilish
2. [ ] Monitoring tizimi
3. [ ] Penetration test
4. [ ] Xodimlar o'qitish

### Uchinchi Ustuvorlik (6 oy)
1. [ ] ISO 27001 sertifikatsiya
2. [ ] PCI DSS assessment
3. [ ] External audit

---

## Imzolar

| Lavozim | Ism | Imzo | Sana |
|---------|-----|------|------|
| Tekshiruvchi | | | |
| IT Manager | | | |
| CISO | | | |

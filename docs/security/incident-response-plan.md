# 🚨 Xavfsizlik Hodisalariga Javob Rejasi

## 📋 Hujjat Ma'lumotlari

| Maydon | Qiymat |
|--------|--------|
| Hujjat nomi | Incident Response Plan |
| Versiya | 1.0 |
| Sana | 2024-01-20 |
| Tasdiqladi | [Rahbar ismi] |

---

## 1. Kirish

### 1.1 Maqsad

Ushbu hujjat xavfsizlik hodisalari yuzaga kelganda tezkor va samarali javob berish uchun mo'ljallangan.

### 1.2 Qamrov

- DDoS hujumlari
- Ma'lumotlar o'g'irlash
- Noto'g'ri kirish urinishlari
- Malware infektsiyasi
- Ichki tahdidlar
- Tizim buzilishi

---

## 2. Hodisa Tasnifi

### 2.1 Darajalar

| Daraja | Nomi | Tavsif | Vaqt | Mas'ul |
|--------|------|--------|------|--------|
| **P1** | Kritik | Tizim to'liq ishlamaydi | 15 min | CISO |
| **P2** | Yuqori | Muhim funksiya buzilgan | 1 soat | IT Manager |
| **P3** | O'rta | Qisman buzilish | 4 soat | IT Team |
| **P4** | Past | Kichik muammo | 24 soat | IT Team |

### 2.2 Hodisa Turlari

| Tur | Kod | Tavsif |
|-----|-----|--------|
| DDoS | INC-DDoS | Distributed Denial of Service |
| Auth | INC-Auth | Autentifikatsiya buzilishi |
| Data | INC-Data | Ma'lumotlar o'g'irlash/o'chirish |
| Malware | INC-Mal | Zararli dastur |
| Insider | INC-Ins | Ichki tahdid |
| System | INC-Sys | Tizim xatosi |

---

## 3. Javob Jamoasi

### 3.1 Tarkib

| Rol | Ism | Telefon | Email |
|-----|-----|---------|-------|
| **Jamoa rahbari** | | | |
| **Texnik mutaxassis** | | | |
| **Aloqa mas'ul** | | | |
| **Huquq maslahatchi** | | | |
| **HR mas'ul** | | | |

### 3.2 Mas'uliyatlar

#### Jamoa Rahbari
- Umumiy boshqaruv
- Qaror qabul qilish
- Rahbariyatga xabar berish

#### Texnik Mutaxassis
- Hodisani tahlil qilish
- Texnik choralar
- Tizimlarni tiklash

#### Aloqa Mas'ul
- Ichki aloqa
- Tashqi aloqa
- OAV bilan ishlash

#### Huquq Maslahatchi
- Huquqiy masalalar
- Regulyatorlarga xabar
- Hujjatlashtirish

---

## 4. Jarayon

### 4.1 Umumiy Diagramma

```
┌─────────────────────────────────────────────────────────────────┐
│                    HODISA JARAYONI                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐      │
│  │ ANIQLASH│───▶│ BAHOLASH│───▶│ CHEKLASH│───▶│BARTARAF │      │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘      │
│                                                      │          │
│                                                      ▼          │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐      │
│  │ YAKUNLASH│◀──│ HISOBAT │◀──│ TERGOV  │◀──│ QAYTA   │      │
│  │          │    │         │    │         │    │ TIKLASH │      │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Bosqichlar

#### 1. Aniqlash (Detection)

| Manba | Vaqt | Amal |
|-------|------|------|
| Monitoring | Real-time | Avtomatik signal |
| Xodimlar | Darhol | Qo'ng'iroq/email |
| Mijozlar | Darhol | Support ticket |
| Uchinchi tomon | 24 soat | Xabar |

**Aniqlash belgilari:**
- Noodatiy tarmoq faoliyati
- Ko'p noto'g'ri login urinishlari
- Tizim sekinlashishi
- Ma'lumotlar o'zgarishi
- Foydalanuvchi shikoyatlari

#### 2. Baholash (Assessment)

| Parametr | Tavsif |
|----------|--------|
| Hodisa turi | DDoS, Auth, Data, ... |
| Daraja | P1, P2, P3, P4 |
| Ta'sir doirasi | Qancha foydalanuvchi |
| Ma'lumotlar | Qanday ma'lumotlar |
| Vaqt | Qachon boshlangan |

**Baholash formasi:**
```
Hodisa ID: INC-2024-001
Sana/Vaqt: 2024-01-20 10:00
Tur: INC-Auth
Daraja: P2
Ta'sir: 1000+ foydalanuvchi
Tavsif: Ko'p noto'g'ri login urinishlari
```

#### 3. Cheklash (Containment)

**Tezkor choralar:**
| Hodisa | Chora |
|--------|-------|
| DDoS | IP bloklash, rate limiting |
| Auth | Hisob bloklash, parol o'zgartirish |
| Data | Kirishni to'xtatish |
| Malware | Tizimni ajratish |

**Cheklash bosqichlari:**
1. Qisqa muddatli (darhol)
2. O'rta muddatli (1-4 soat)
3. Uzoq muddatli (kunlar)

#### 4. Bartaraf Etish (Eradication)

| Bosqich | Amal |
|---------|------|
| 1 | Tahdid manbasini aniqlash |
| 2 | Zararli kodni o'chirish |
| 3 | Zaiflikni tuzatish |
| 4 | Tizimni tozalash |

#### 5. Qayta Tiklash (Recovery)

| Bosqich | Amal |
|---------|------|
| 1 | Tizimlarni tekshirish |
| 2 | Backup dan tiklash |
| 3 | Monitoringni kuchaytirish |
| 4 | Normal ishlashni tasdiqlash |

#### 6. Tergov (Investigation)

| Savol | Javob |
|-------|-------|
| Nima sodir bo'ldi? | |
| Qachon sodir bo'ldi? | |
| Qanday sodir bo'ldi? | |
| Kim mas'ul? | |
| Qanday oldini olish mumkin? | |

#### 7. Hisobat (Reporting)

**Ichki hisobat:**
- Hodisa tavsifi
- Ta'sir bahosi
- Qabul qilingan choralar
- Olingan saboqlar
- Tavsiyalar

**Tashqi hisobat (agar kerak bo'lsa):**
- Regulyatorlarga
- Mijozlarga
- OAV ga

---

## 5. Aloqa Rejasi

### 5.1 Ichki Aloqa

| Daraja | Kim | Usul | Vaqt |
|--------|-----|------|------|
| P1 | Barcha rahbarlar | Telefon | Darhol |
| P2 | IT, Xavfsizlik | Email/Slack | 15 min |
| P3 | IT jamoasi | Email | 1 soat |
| P4 | IT jamoasi | Ticket | 4 soat |

### 5.2 Tashqi Aloqa

| Holat | Kim | Usul | Vaqt |
|-------|-----|------|------|
| Ma'lumot buzilishi | Mijozlar | Email | 72 soat |
| DDoS | ISP | Telefon | Darhol |
| Jinoyat | Militsiya | Ariza | 24 soat |

### 5.3 Shablonlar

#### Ichki xabar
```
Mavzu: [P1/P2/P3/P4] Xavfsizlik hodisasi - INC-2024-001

Hodisa turi: [Tur]
Daraja: [P1-P4]
Vaqt: [Sana vaqt]
Ta'sir: [Tavsif]
Holat: [Faol/Cheklanib/Bartaraf etildi]

Joriy harakatlar:
- [Harakat 1]
- [Harakat 2]

Keyingi qadamlar:
- [Qadam 1]
- [Qadam 2]

Mas'ul: [Ism]
Aloqa: [Telefon/Email]
```

#### Tashqi xabar (mijozlarga)
```
Hurmatli mijoz,

[Sana] sanada xavfsizlik hodisasi yuz berdi.

Ta'sir qilgan ma'lumotlar:
- [Ma'lumot turi]

Qabul qilingan choralar:
- [Chora 1]
- [Chora 2]

Tavsiyalar:
- [Tavsiya 1]
- [Tavsiya 2]

Savollar bo'lsa: [Aloqa ma'lumotlari]

Hurmat bilan,
[Tashkilot nomi]
```

---

## 6. Maxsus Ssenariylar

### 6.1 DDoS Hujumi

```
┌─────────────────────────────────────────────────────────────────┐
│                    DDoS RESPONSE                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. ANIQLASH (5 min)                                            │
│     └── Monitoring: CPU > 80%, Traffic > normal                 │
│                                                                  │
│  2. BAHOLASH (10 min)                                           │
│     └── Hujum turi: SYN flood, HTTP flood, etc.                 │
│                                                                  │
│  3. CHEKLASH (15 min)                                           │
│     ├── Enable rate limiting                                    │
│     ├── Block attacking IPs                                     │
│     ├── Enable DDoS protection (Cloudflare)                     │
│     └── Contact ISP                                             │
│                                                                  │
│  4. KUZATISH (davom etadi)                                      │
│     └── Monitor traffic, adjust rules                           │
│                                                                  │
│  5. HISOBAT (24 soat)                                           │
│     └── Document attack, update defenses                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Ma'lumot Buzilishi

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA BREACH RESPONSE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. ANIQLASH                                                    │
│     └── Noodatiy ma'lumot oqimi, tashqi xabar                   │
│                                                                  │
│  2. BAHOLASH                                                    │
│     ├── Qanday ma'lumotlar?                                     │
│     ├── Qancha yozuvlar?                                        │
│     └── Qachon sodir bo'lgan?                                   │
│                                                                  │
│  3. CHEKLASH                                                    │
│     ├── Zaiflikni yopish                                        │
│     ├── Kirish huquqlarini o'zgartirish                         │
│     └── Monitoringni kuchaytirish                               │
│                                                                  │
│  4. XABARDOR QILISH (72 soat ichida)                           │
│     ├── Regulyatorlar                                           │
│     ├── Ta'sir qilingan shaxslar                                │
│     └── OAV (agar kerak)                                        │
│                                                                  │
│  5. TERGOV                                                      │
│     └── Sabab, javobgarlik                                      │
│                                                                  │
│  6. OLDINI OLISH                                                │
│     └── Yangi xavfsizlik choralari                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Ichki Tahdid

```
┌─────────────────────────────────────────────────────────────────┐
│                    INSIDER THREAT RESPONSE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. ANIQLASH                                                    │
│     └── Audit log, xodim xabari                                 │
│                                                                  │
│  2. BAHOLASH                                                    │
│     ├── Kim?                                                    │
│     ├── Nima qildi?                                             │
│     └── Qanday ta'sir?                                          │
│                                                                  │
│  3. CHEKLASH                                                    │
│     ├── Hisobni bloklash                                        │
│     ├── Kirish huquqlarini olib tashlash                        │
│     └── Jismoniy kirishni cheklash                              │
│                                                                  │
│  4. TERGOV                                                      │
│     ├── HR bilan hamkorlik                                      │
│     ├── Huquqiy maslahat                                        │
│     └── Hujjatlashtirish                                        │
│                                                                  │
│  5. INTIZOMIY CHORALAR                                          │
│     ├── Ogohlantirish                                           │
│     ├── Ishdan bo'shatish                                       │
│     └── Huquqiy ta'qib                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Asboblar

### 7.1 Monitoring

| Asbob | Maqsad |
|-------|--------|
| Prometheus | Tizim monitoring |
| Grafana | Vizualizatsiya |
| ELK Stack | Log tahlil |
| Sentry | Xato kuzatish |

### 7.2 Xavfsizlik

| Asbob | Maqsad |
|-------|--------|
| Fail2ban | IP bloklash |
| ModSecurity | WAF |
| ClamAV | Antivirus |
| Rkhunter | Rootkit skaner |

### 7.3 Aloqa

| Asbob | Maqsad |
|-------|--------|
| Slack | Ichki aloqa |
| Email | Rasmiy xabar |
| SMS | Tezkor xabar |
| Telefon | Shoshilinch |

---

## 8. Amaliyot

### 8.1 Mashg'ulotlar

| Tur | Chastota | Ishtirokchilar |
|-----|----------|----------------|
| Stol mashqi | Har chorak | Javob jamoasi |
| Texnik mashq | Har yili | IT jamoasi |
| To'liq mashq | Har yili | Barcha |

### 8.2 Mashq Ssenariysi

```
Sana: 2024-XX-XX
Vaqt: 10:00
Ssenariy: DDoS hujumi simulyatsiyasi

1. 10:00 - Hodisa boshlandi (simulyatsiya)
2. 10:05 - Monitoring signal berdi
3. 10:10 - Jamoa yig'ildi
4. 10:15 - Baholash tugadi
5. 10:30 - Cheklash choralarini amalga oshirdi
6. 11:00 - Hodisa bartaraf etildi
7. 11:30 - Hisobat tayyorlandi

Natija: [Muvaffaqiyatli/Muammo]
Saboqlar: [Qayd etish]
```

---

## 9. Hujjatlashtirish

### 9.1 Hodisa Formasi

```markdown
# Hodisa Hisoboti

## Umumiy ma'lumotlar
- Hodisa ID: INC-2024-XXX
- Sana: YYYY-MM-DD
- Vaqt: HH:MM
- Daraja: P1/P2/P3/P4
- Tur: INC-XXX

## Tavsif
[Batafsil tavsif]

## Ta'sir
- Foydalanuvchilar: X ta
- Tizimlar: [Ro'yxat]
- Ma'lumotlar: [Tavsif]

## Xronologiya
| Vaqt | Hodisa |
|------|--------|
| | |

## Qabul qilingan choralar
1.
2.
3.

## Natija
[Tavsif]

## Saboqlar
1.
2.

## Tavsiyalar
1.
2.

## Ilovalar
- Log fayllar
- Screenshotlar
- Boshqa hujjatlar
```

---

## 10. Qo'shimcha

### 10.1 Foydali Manbalar

- NIST Incident Handling Guide
- SANS Incident Handler's Handbook
- OWASP Incident Response

### 10.2 Aloqa Ma'lumotlari

| Tashkilot | Telefon | Email |
|-----------|---------|-------|
| CERT | | |
| ISP | | |
| Huquqiy | | |
| Sug'urta | | |

---

## Imzolar

| Lavozim | Ism | Imzo | Sana |
|---------|-----|------|------|
| Rahbar | | | |
| CISO | | | |
| IT Manager | | | |

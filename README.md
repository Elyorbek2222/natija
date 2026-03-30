# TARGEET — Marketing Analytics Dashboard

Multi-platform reklama tahlil platformasi. Excel hisobotlarini yuklang, barcha ko'rsatkichlar avtomatik vizualizatsiya qilinadi.

**Sayt:** [targeet.uz](https://targeet.uz)

---

## Loyiha tuzilmasi

```
Marketing Dashboard/
├── index.html          # Kirish sahifasi (3-slayd onboarding)
├── paywall.html        # To'lov sahifasi (Ipak Yo'li + Visa)
├── dashboard.html      # Asosiy dashboard
├── upload.html         # Excel yuklash sahifasi
├── analyst.html        # AI tahlilchi sahifasi
├── admin.html          # Admin panel (foydalanuvchilarni boshqarish)
├── css/
│   └── styles.css      # Dashboard CSS (mobile responsive)
├── js/
│   ├── app.js          # Asosiy dashboard logikasi
│   ├── charts.js       # ApexCharts konfiguratsiyasi
│   ├── utils.js        # Yordamchi funksiyalar
│   ├── assistant.js    # AI assistant logikasi
│   └── i18n.js         # UZ/RU tarjimalar
├── assets/
│   └── firebase.js     # Firebase konfiguratsiya
└── firestore.rules     # Firestore xavfsizlik qoidalari
```

---

## Qo'shilgan funksiyalar (tarix bo'yicha)

### 1. Dashboard refaktoring — CSS/JS ajratish
- `dashboard.html` dagi barcha CSS → `css/styles.css` ga ko'chirildi
- JS kodi 3 modulga bo'lindi: `app.js`, `charts.js`, `utils.js`
- ApexCharts: sparkline, bar, scatter, heatmap grafiklar

### 2. Login sahifasi — Multi-platform tasmasi
- Cheksiz aylanuvchan platform taglar: Meta Ads, Google Ads, Yandex Direct, Telegram Ads, YouTube, Instagram, SEO, Email
- CSS animatsiya `scrollPlatforms 18s linear infinite`

### 3. Paywall — To'liq dizayn qayta ishlash
- Maqsad brending: TARGEET logo + mini 3D orbit header da
- Fon: past opasiteli particle network (opacity 0.45)
- Narx kartalar birinchi ekranda (above fold)
- To'lov modal: 2 ta karta + Telegram yo'naltirish
  - **Ipak Yo'li:** `8600 1402 9591 5319`
  - **Visa UZS:** `4023 0605 1005 3621`
- Karta raqamini nusxalash tugmasi
- Telegram xabar avtomatik to'ldiriladi (ism, email, plan, UID)

### 4. To'lov xatosi tuzatish — Real-time auth
- **Muammo:** Admin dostup bergandan keyin foydalanuvchi paywall da qotib qolar edi
- **Yechim:** `getDoc()` → `onSnapshot()` almashtirildi
- Endi admin `isPaid = true` qo'yishi bilan sahifa avtomatik dashboardga o'tadi

### 5. UZ/RU tarjima tizimi
- `js/i18n.js` — 200+ kalit, ikkala tilda
- `data-i18n`, `data-i18n-html`, `data-i18n-placeholder` atributlari
- `localStorage` da saqlash (`targeet_lang` kalit)
- `_addKeys()` metodi — yangi kalitlarni dinamik qo'shish uchun
- Barcha sahifalarda UZ/RU tugmalari ishlaydi

### 6. Yandex Metrika
- ID: `108305889`
- Barcha 5 ta sahifada `<head>` da joylashtirildi
- Webvisor, clickmap, ecommerce yoqilgan

### 7. Dashboard — Mobile responsive
- `css/styles.css` ga 50+ qator media query qo'shildi
- **≤768px (tablet):** sidebar yashirildi, 2-ustunli KPI, jadval gorizontal scroll
- **≤480px (mobile):** 2×2 KPI grid, past navigatsiya paneli
- Pastki nav: Dashboard | Yuklash | AI | Chiqish

### 8. Admin panel — 3 kunlik test dostup
- `🧪 Test / Bepul / +3 kun` kartochkasi qo'shildi
- `confirmGrant()` → `paidUntil = hozir + 3 kun`, `paymentProvider: "trial"`
- Toast xabari: "3 kunlik test"

### 9. Index — 3-slayd onboarding
**Slayd 1 — Bu platform kimlar uchun?**
- 4 ta audience karta (2×2 grid, hover animatsiya):
  - 🎬 Info-biznes Producerlar (ko'k)
  - 🏢 Biznes Egalari (yashil)
  - 📊 Marketologlar (binafsha)
  - 🎯 Targetologlar (qizil)
- "Davom etish →" tugmasi

**Slayd 2 — Kirish**
- Platform scroll tasmasi
- Google OAuth login
- Trust badges
- "Avval ichkarini ko'rish →" linki

**Slayd 3 — Dashboard Preview**
- CSS bilan yasalgan dashboard mockup:
  - 4 ta KPI karta ($2,470 | 847 | $2.91 | 399K)
  - Bar chart + chiziqli grafik
  - Kampaniyalar jadvali (3 qator)
- "Boshlash — Kirish" tugmasi
- Swipe (mobile) va progress dots navigatsiya

### 10. Qo'llab-quvvatlash widget
- Barcha sahifalarda `?` tugmasi (pastki o'ng)
- Popup: @eoautomations Telegram linki

---

## Texnologiyalar

| Texnologiya | Ishlatilishi |
|---|---|
| Firebase Auth | Google OAuth kirish |
| Firestore | Foydalanuvchi ma'lumotlari, to'lov holati |
| ApexCharts | Interaktiv grafiklar |
| Yandex Metrika | Analitika (ID: 108305889) |
| Vercel | Hosting + auto-deploy (GitHub push) |
| Vanilla JS | Barcha frontend logikasi |

---

## To'lov ma'lumotlari

| Bank | Karta raqami | Valyuta |
|---|---|---|
| Ipak Yo'li | 8600 1402 9591 5319 | UZS |
| Visa | 4023 0605 1005 3621 | UZS |

**Telegram:** @eoautomations

---

## Narx rejalari

| Reja | Narx | Muddat |
|---|---|---|
| Oylik | 200 000 UZS | 1 oy |
| 3 Oylik | 500 000 UZS | 3 oy |
| Test | Bepul | 3 kun |

---

## Admin panel

`admin.html` sahifasida foydalanuvchilarga qo'lda dostup ochish:
1. Foydalanuvchini topib "Dostup berish" tugmasini bosing
2. Reja tanlang: Oylik / 3 Oylik / Test (3 kun)
3. "Tasdiqlash" — Firestore da `isPaid: true`, `paidUntil` yoziladi
4. Foydalanuvchi paywall dan avtomatik dashboardga o'tadi (real-time)

---

## Git commits

```
d18d388  Index: 3-slide onboarding — audience, login, dashboard preview
240031d  Admin: 3-day trial access + paywall real-time auth fix
501af61  Dashboard: mobile responsive layout + bottom nav
1e2fbc0  i18n: full UZ/RU translations for index.html and paywall.html
051c048  Add Yandex Metrika (ID: 108305889) to all pages
6e29a2b  index.html: add missing CSS for support widget
785e101  Paywall: add real card numbers (Ipak Yo'li + Visa UZS)
26e7017  Paywall: add payment modal with card numbers + Telegram flow
df0a3ee  Paywall: fix lang buttons, stronger headline, bigger font
da91ed3  Paywall layout fix: pricing above fold, mini orbit in header
a6b8b2b  Add support bar with EO Automation links on all pages
1fbe1da  Add AI assistant, i18n UZ/RU, Vercel Analytics
5f786d0  Login page: add multi-platform scrolling tag strip
543e626  Refactor dashboard: css/js separation + rich charts
```

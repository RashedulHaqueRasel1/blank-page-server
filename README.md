# ⚙️ Blank Page Server — Backend (Express & Prisma)

**Blank Page Server** হলো Blank Notes অ্যাপ্লিকেশনের ব্যাকএন্ড RESTful API এবং রিয়েল-টাইম WebSocket সার্ভার। এটি Node.js, Express 5, Prisma ORM 6 (MongoDB Database Provider), Socket.IO, Nodemailer এবং OpenRouter AI দিয়ে তৈরি।

---

## 📑 বিষয়সূচি (Table of Contents)
1. [প্রজেক্ট ওভারভিউ (Overview)](#-প্রজেক্ট-ওভারভিউ-overview)
2. [সিস্টেম আর্কিটেকচার ও মডিউলসমূহ (Modules & Architecture)](#-সিস্টেম-আর্কিটেকচার-ও-মডিউলসমূহ-modules--architecture)
3. [ডাটাবেজ স্কিমা ও মডেলসমূহ (Database Schema)](#-ডাটাবেজ-স্কিমা-ও-মডেলসমূহ-database-schema)
4. [প্রজেক্ট ফোল্ডার স্ট্রাকচার (Folder Structure)](#-প্রজেক্ট-ফোল্ডার-স্ট্রাকচার-folder-structure)
5. [API ডক্যুমেন্টেশন (API Docs & Scalar UI)](#-api-ডক্যুমেন্টেশন-api-docs--scalar-ui)
6. [এনভায়রনমেন্ট ভ্যারিয়েবল (Environment Variables)](#-এনভায়রনমেন্ট-ভ্যারিয়েবল-environment-variables)
7. [ইনস্টলেশন ও রান করার উপায় (Setup & Run)](#-ইনস্টলেশন-ও-রান-করার-উপায়-setup--run)

---

## 🚀 প্রজেক্ট ওভারভিউ (Overview)

এই ব্যাকএন্ড সার্ভারটি ফ্রন্টএন্ডের সমস্ত ডাটাবেজ অপারেশন পরিচালনা করে। যেমন:
- কাস্টম পাবলিশড পেজ তৈরি, পাসওয়ার্ড চেক, ভিউ কাউন্ট ও লাইভ এডিটিং।
- ইউজারদের নোট ড্রাফট ক্লাউডে সুরক্ষিত রাখা (Backup/Restore)।
- OTP কোড তৈরি ও ইমেইল পাঠানো (Nodemailer Verification)।
- OpenRouter AI (GPT-4o-mini / Llama 3) দিয়ে টাইপিং টেস্টের কন্টেন্ট জেনারেট করা।
- রিয়েল-টাইম সকেট সংযোগ (Socket.IO) দিয়ে নোটের লাইভ সিঙ্ক।

---

## 🧩 সিস্টেম আর্কিটেকচার ও মডিউলসমূহ (Modules & Architecture)

ব্যাকএন্ডটি মডিউলার আর্কিটেকচার (Modular Architecture) মেনে সাজানো হয়েছে:

1. **`publish`**:
   - `POST /api/v1/pages/publish`: নতুন নোট অনলাইনে পাবলিশ করা।
   - `GET /api/v1/pages/:customUrl/view`: পাবলিশড পেজ লোড ও ভিউয়ার লগ আপডেট।
   - `POST /api/v1/pages/:customUrl/verify`: পাসওয়ার্ড প্রটেক্টেড পেজ আনলক করা।
   - `PUT /api/v1/pages/:customUrl`: লাইভ নোটের কন্টেন্ট বা মেটাডেটা আপডেট করা।
   - `DELETE /api/v1/pages/:customUrl`: পাবলিশড নোট মুছে ফেলা।

2. **`backup`**:
   - `POST /api/v1/backups/sync`: ফ্রন্টএন্ডের IndexedDB নোটগুলো ক্লাউড ডাটাবেজে ব্যাকআপ করা।
   - `GET /api/v1/backups/status`: ইউজার ইমেইলের ব্যাকআপ স্ট্যাটাস ও তারিখ চেক করা।

3. **`subscriber`**:
   - `POST /api/v1/subscribers`: সাবস্ক্রিপশন / ব্যাকআপ ভেরিফিকেশনের জন্য ইমেইলে OTP কোড পাঠানো।
   - `POST /api/v1/subscribers/verify`: OTP ভেরিফাই করে `backupToken` প্রদান করা।

4. **`typing-test`**:
   - `POST /api/v1/typing-test/session`: AI (OpenRouter API) দিয়ে যেকোনো টপিক বা ভাষায় টাইপিং টেস্ট প্যারাগ্রাফ তৈরি করা এবং টেস্টের পয়েন্ট/WPM রেজাল্ট সেভ করা।

5. **`auth` & `user`**:
   - অ্যাডমিন/ইউজার লগইন, পাসওয়ার্ড হ্যাশিং (Bcrypt) ও JWT টোকেন জেনারেট করা।

6. **`socket.ts` (Real-Time WebSockets)**:
   - `join-page`: এডিটেবল নোট রুমে জয়েন করা।
   - `page-updated`: কন্টেন্ট পরিবর্তন হলে সাথে সাথে সমস্ত ক্লায়েন্টকে ব্রডকাস্ট করা।
   - `user-editing`: কেউ টাইপ করলে এডিটিং ইন্ডিকেটর পাঠানো।

---

## 🗄️ ডাটাবেজ স্কিমা ও মডেলসমূহ (Database Schema)

Prisma Schema (`prisma/schema.prisma`) অনুযায়ী মডেলসমূহ:

| মডেল নাম | বিবরণ |
| :--- | :--- |
| **`PublishedPage`** | পাবলিশ করা নোটসমূহ (customUrl, content, password, expiresAt, viewerLog, editorLog) |
| **`UserBackup`** | ইউজারের ক্লাউড ব্যাকআপ করা ড্রাফট ডকুমেন্টসমূহ (email, documents JSON) |
| **`Subscriber`** | ইমেইল সাবস্ক্রাইবার ও OTP ভেরিফিকেশন স্টেট (verificationCode, backupToken) |
| **`Visitor`** | ওয়েবসাইটে আসা ভিজিটরদের IP, ডিভাইস, ব্রাউজার ও লোকেশন ট্র্যাকিং |
| **`TypingTestSession`** | টাইপিং টেস্টের রেকর্ড (WPM, Accuracy, language, targetText) |
| **`User`** | অ্যাডমিন / রেজিস্টার্ড ইউজার অ্যাকাউন্ট তথ্য |

---

## 📁 প্রজেক্ট ফোল্ডার স্ট্রাকচার (Folder Structure)

```text
blank-page-server/
├── prisma/
│   └── schema.prisma          # Prisma MongoDB স্কিমা ডিফিনিশন
├── src/
│   ├── server.ts              # মূল এন্ট্রি পয়েন্ট (dotenv loader, HTTP & Socket server)
│   ├── app.ts                 # Express অ্যাপ, মিডলওয়্যার ও রুট মাউন্টিং
│   ├── socket.ts              # Socket.IO লাইভ রুম ও ইভেন্ট হ্যান্ডলার
│   ├── openapi.ts             # Swagger / Scalar OpenAPI ডক্যুমেন্টেশন জেনারেটর
│   ├── config/                # Environment Variables কনফিগারেশন
│   ├── lib/
│   │   └── prisma.ts          # Singleton Prisma Client ইনিশিয়ালাইজেশন
│   ├── middlewares/           # Global Error Handler, Auth & Validation Middlewares
│   ├── modules/               # বিজনেস লজিক মডিউলসমূহ (Publish, Backup, Auth, Subscriber, etc.)
│   │   ├── publish/           # Controller, Service, Route & Validation
│   │   ├── backup/            # Controller, Service, Route
│   │   ├── subscriber/        # OTP Verification & Email Service
│   │   └── typing-test/       # AI Typing Test Generator
│   └── utils/                 # Mailer (Nodemailer), Response Formatter
├── openapi.json               # অটো-জেনারেটেড OpenAPI স্কিমা
└── package.json               # ডিলাইন্ডেন্সিজ ও স্ক্রিপ্টসমূহ
```

---

## 📖 API ডক্যুমентেশন (API Docs & Scalar UI)

সার্ভার রান থাকা অবস্থায় ব্রাউজারে নিচের লিংকে গেলে সম্পূর্ণ ইন্টারঅ্যাক্টিভ API ডক্যুমেন্টেশন দেখতে পাবেন:

- **Scalar API Reference**: `http://localhost:5000/docs`
- **OpenAPI JSON Spec**: `http://localhost:5000/openapi.json`

---

## ⚙️ এনভায়রনমেন্ট ভ্যারিয়েবল (Environment Variables)

আপনার `.env` ফাইলে নিচের ভ্যারিয়েবলগুলো সঠিকভাবে দেওয়া থাকতে হবে:

```env
# MongoDB ডাটাবেজ কনেকশন স্ট্রিং
DATABASE_URL="mongodb://username:password@cluster.mongodb.net:27017/blank-page?ssl=true&authSource=admin"

# সার্ভার পোর্ট ও সিপিক্রেট
PORT=5000
JWT_SECRET="supersecretjwtkey"

# AI Integration (OpenRouter)
OPENROUTER_API_KEY=sk-or-v1-...
MODEL_M1=openai/gpt-4o-mini
MODEL_M2=meta-llama/llama-3.1-8b-instruct:free

# ক্লায়েন্ট URL ও সিক্রেট
NEXT_PUBLIC_SERVER_URL="http://localhost:5000"
NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"
NEXTAUTH_SECRET="blank_page_nextauth_secret_key_2026"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 🛠️ ইনস্টলেশন ও রান করার উপায় (Setup & Run)

```bash
# ১. ডিপেন্ডেন্সি ইনস্টল করুন
pnpm install

# ২. Prisma ক্লায়েন্ট জেনারেট করুন
pnpm prisma generate

# ৩. ডেভেলপমেন্ট সার্ভার চালু করুন (Port 5000)
pnpm run dev

# ৪. প্রোডাকশন বিল্ড তৈরি ও রান করতে
pnpm build
pnpm start
```

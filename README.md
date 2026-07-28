# ⚙️ Blank Notes Server — RESTful API & Real-Time Engine

> A high-performance, modular backend server for **Blank Notes** built with Node.js, Express 5, Prisma ORM 6 (MongoDB), Brevo Transactional Email REST API, Socket.IO, and OpenRouter AI.

---

## 📋 Table of Contents
- [Features](#-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Database Schema & Models](#-database-schema--models)
- [Module Breakdown](#-module-breakdown)
- [API Documentation](#-api-documentation)
- [Environment Configuration](#-environment-configuration)
- [Getting Started](#-getting-started)
- [Author](#-author)
- [License](#-license)

---

## 🚀 Features

- 📝 **Live Page Publishing**: Create, view, update, and delete published notes with custom slug URLs.
- 🔒 **Password & Security Rules**: Password protection, one-time viewing, editable notes, and automated expiration policies.
- ⚡ **Real-Time WebSockets**: Instant multi-user document collaboration and editing indicators powered by Socket.IO.
- 📧 **Brevo Email Integration**: High-deliverability transactional emails for single-use OTP verification and welcome confirmations.
- 🛡️ **Single-Use OTP Security**: 6-digit OTP verification codes with 5-minute strict expiration windows and automated single-use burning.
- 💾 **Cloud Backup & Sync**: Encrypted email-verified backup access allowing users to back up and restore local IndexedDB notes.
- 🤖 **AI Content Generation**: Dynamic typing test paragraph generation across multiple languages via OpenRouter AI.

---

## 🛠️ Architecture & Tech Stack

- **Runtime & Framework**: Node.js (v20+), Express 5
- **Database & ORM**: MongoDB with Prisma ORM 6
- **Real-Time Engine**: Socket.IO 4
- **Email Service**: Brevo Transactional Email REST API v3 / Nodemailer
- **AI Service**: OpenRouter API (`gpt-4o-mini`, `llama-3.1-8b`)
- **API Spec & Docs**: OpenAPI 3.0 & Scalar API Reference
- **Language**: TypeScript

---

## 🗄️ Database Schema & Models

The database structure is defined in `prisma/schema.prisma`:

| Model | Purpose | Key Attributes |
| :--- | :--- | :--- |
| **`PublishedPage`** | Online published notes | `customUrl`, `content`, `password`, `isEditable`, `expiresAt`, `viewerLog`, `editorLog` |
| **`Subscriber`** | Email verification & subscriptions | `email`, `isVerified`, `verificationCode`, `verificationExpiresAt`, `backupToken` |
| **`UserBackup`** | Cloud backup of local notes | `email`, `documents` (JSON array of drafts), `isEnabled`, `lastSyncedAt` |
| **`Visitor`** | Site traffic & analytics | `ip`, `userAgent`, `deviceType`, `country`, `city`, `visitCount` |
| **`TypingTestSession`** | Typing speed benchmarks | `ownerId`, `language`, `duration`, `targetText`, `result` (WPM & accuracy) |
| **`User`** | System administrators | `email`, `password` (hashed), `role`, `loginCount` |

---

## 📁 Module Breakdown

The codebase follows a scalable **Modular Architecture**:

```text
src/
├── config/              # Environment configurations and global settings
├── errors/              # Custom API error handling & global error middleware
├── generated/client/    # Generated Prisma Client
├── lib/                 # Prisma singleton instance
├── middlewares/          # Request validation, Auth JWT, and rate limiters
├── modules/
│   ├── auth/            # Admin/User registration, authentication, & JWT profile
│   ├── backup/          # Cloud backup sync & restore endpoints
│   ├── publish/         # Page publishing, password protection, & live editing
│   ├── subscriber/      # Email verification, single-use OTP, & subscriber management
│   ├── typing-test/     # OpenRouter AI paragraph generation & result scoring
│   └── user/            # User profile management
├── utils/               # Brevo REST mailer, hash helpers, & response formatters
├── openapi.ts           # Scalar / Swagger documentation generator
├── server.ts            # Application bootstrapper and Socket.IO initialization
└── socket.ts            # Real-time WebSocket room logic
```

---

## 📖 API Documentation

Interactive OpenAPI documentation is generated automatically when the server runs:

- **Scalar Interactive API Docs**: `http://localhost:5000/docs`
- **OpenAPI JSON Spec**: `http://localhost:5000/openapi.json`

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory. **Do not commit actual secrets to version control.**

```env
# Node Environment & Port
NODE_ENV=development
PORT=5000
SERVER_URL="http://localhost:5000"

# Database Connection (MongoDB)
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/blank-page?ssl=true&authSource=admin"

# JWT Authentication Secret
JWT_SECRET="your_jwt_secret_key"

```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js**: `>= 20.20.0`
- **pnpm**: `>= 10.x`
- **MongoDB**: Cloud Atlas or Local Instance

### Installation & Execution

```bash
# 1. Install dependencies
pnpm install

# 2. Generate Prisma Client
pnpm prisma generate

# 3. Start Development Server
pnpm dev

# 4. Build for Production
pnpm build

# 5. Start Production Server
pnpm start
```

---

## 🧑‍💻 Author

**Rashedul Haque Rasel**

- 💬 WhatsApp: [+8801772582460](https://wa.me/8801772582460)
- 📧 Email: [rashedulhaquerasel1@gmail.com](mailto:rashedulhaquerasel1@gmail.com)
- 🌐 Portfolio: [rashedul-haque-rasel.vercel.app](https://rashedul-haque-rasel.vercel.app)
- 💼 LinkedIn: [Rashedul Haque Rasel](https://www.linkedin.com/in/rashedul-haque-rasel)

---

## 📄 License

This project is open source and available under the [ISC License](LICENSE).

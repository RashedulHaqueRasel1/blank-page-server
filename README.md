# Blank Page — Backend Server

This is the **Express.js + Prisma + MongoDB** backend for the **Blank Page** minimalist writing and publishing platform. It handles all publishing logic, author authentication, real-time collaboration, and password-protected page verification.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Express.js + Node.js |
| Language | TypeScript |
| ORM | Prisma Client |
| Database | MongoDB Atlas |
| Real-time | Socket.IO |
| Security | CORS, JWT, API Secret Middleware |

---

## 🚀 Core Modules & Logic

### 1. Publishing Engine (`publish.service.ts`)
- Dynamically generates unique, human-friendly page slugs using `nanoid`.
- Stores page `content`, `title`, `isEditable`, `expiresAt`, `authorId`, and optional `password` to MongoDB.
- Authors are identified by a persistent `writer-id` generated client-side (no login required).
- Supports configurable auto-expiration (1h → 30 days → never).

### 2. Password Protection
- Pages can optionally be published with a `password` field stored in MongoDB.
- `getPageByUrl` — If a page has a password, the `content` is **completely removed** from the response and replaced with `{ isProtected: true }`. No content is ever leaked to unauthorized viewers.
- `verifyPagePassword` — Accepts a visitor's password, validates it against the stored value, and if correct, returns the full page content.
- `fetchPageByAuthor` — Authors can fetch their own protected pages by providing their `authorId`, bypassing the password check entirely.

### 3. Author Sync & Live Update
- `updatePageByAuthor` — Validates that the requester is the original author before allowing any content update.
- **Word-Level Diffing** — On every update, the server strips HTML tags and computes the exact `added` and `removed` words between the old and new content. This diff is appended to an immutable `authorEditsLog` array in MongoDB.
- **Real-Time Broadcast** — After a successful update, the new content is broadcast to all connected Socket.IO clients viewing that page.

### 4. Real-Time Collaboration (Socket.IO)
- Clients join a "room" identified by the page's `customUrl`.
- `edit-page` events are emitted by editing clients and broadcast to all other viewers in the same room.
- Gracefully skips Socket.IO connection when the server URL is a local address but the client is on a public domain (production safety).

### 5. Strict Security & Data Masking
- All Prisma queries use strict `select` projections — internal MongoDB `_id`s, raw `authorEditsLog`, and `viewerLog` arrays are never exposed in public responses.
- API routes are protected by `CORS` configuration and an internal `INTERNAL_API_SECRET` for sensitive admin operations.
- No localhost fallback logic. All configuration is strictly pulled from `.env`.

---

## 📡 API Routes

### Published Pages (`/api/v1/pages`)

| Method | Route | Description |
|---|---|---|
| `POST` | `/` | Publish a new page (optional password) |
| `GET` | `/:customUrl` | Fetch a page (content hidden if protected) |
| `PATCH` | `/:customUrl` | Collaborative content update |
| `PUT` | `/author/update/:customUrl` | Author-authenticated full update |
| `POST` | `/author/fetch/:customUrl` | Author-authenticated fetch (bypasses password) |
| `POST` | `/verify/:customUrl` | Verify password and retrieve protected page content |
| `GET` | `/author/:authorId` | Get all pages by an author |
| `DELETE` | `/:customUrl` | Soft-delete a published page |
| `GET` | `/admin/all` | Admin — get all pages |

---

## 📁 Project Structure

```
blank-page-server/
├── prisma/
│   └── schema.prisma          # PublishedPage model with password field
├── src/
│   ├── app.ts                 # Express app + Socket.IO setup
│   ├── server.ts              # HTTP server entry point
│   ├── lib/
│   │   └── prisma.ts          # Prisma client singleton
│   ├── errors/
│   │   └── ApiError.ts        # Custom error class
│   ├── utils/
│   │   ├── catchAsync.ts      # Async error wrapper
│   │   └── sendResponse.ts    # Unified response helper
│   └── modules/
│       └── publish/
│           ├── publish.routes.ts      # Route definitions
│           ├── publish.controller.ts  # Request handlers
│           └── publish.service.ts     # Core business logic
```

---

## 🗄️ Database Schema (`PublishedPage`)

```prisma
model PublishedPage {
  id             String    @id @default(auto()) @map("_id") @db.ObjectId
  customUrl      String    @unique
  content        String
  title          String?
  isEditable     Boolean   @default(false)
  password       String?   // Optional secret key for page protection
  authorId       String?
  authorIp       String?
  userId         String?
  pinned         Boolean   @default(false)
  isDeleted      Boolean   @default(false)
  expiresAt      DateTime?
  authorEditsLog Json[]
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```

---

## 📦 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure `.env`
```env
DATABASE_URL="mongodb+srv://<user>:<password>@cluster.mongodb.net/blank-page"
PORT=5000
JWT_SECRET=your_jwt_secret_here
```

### 3. Sync Database Schema
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```

Server starts at **http://localhost:5000**

---

## 🔐 Password Protection Flow

```
POST /api/v1/pages  { ..., password: "mykey" }
         ↓
Stored in MongoDB as plaintext secret key
         ↓
GET /api/v1/pages/:url  → content stripped → { isProtected: true }
         ↓
POST /api/v1/pages/verify/:url  { password: "mykey" }
         ↓
Match found → returns full page content
         ↓
POST /api/v1/pages/author/fetch/:url  { authorId: "user-xyz" }
         ↓
Author confirmed → returns full page content (no password needed)
```

---

*For frontend integration and the full project overview, see the `README.md` in the `/blank-page` directory.*

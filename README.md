# Blank Page - Server Architecture

This is the backend server for the **Blank Page Minimalist AI-Powered Writing Editor**. 

## 🏗️ Technical Stack
- **Framework**: Express.js with Node.js
- **Database ORM**: Prisma Client
- **Database**: MongoDB Atlas
- **Language**: TypeScript

## 🚀 Core Logic & Functionality

### 1. Publishing Engine (`publish.service.ts`)
- Dynamically generates unique URLs (`bp-xyz123`) using the `nanoid` library.
- Safely saves page content, title, and expiration metrics securely to MongoDB.
- Maps an internal `writer-id` (generated on the frontend) as the `authorId` to establish a persistent identity without requiring complex authentication logic.

### 2. Author Sync & Audit System
- **Word-Level Diffing**: When an author updates a live page, the server strips HTML and calculates the exact `added` and `removed` words (e.g., `["hello"] added, ["hi"] removed`).
- **Immutable Log History**: All updates are appended to the `authorEditsLog` JSON array, capturing the IP address, timestamp, title transitions, and word-level diffs. This creates a secure, fast, and immutable audit history of changes.

### 3. Strict Security & Projection Masking
- Responses sent back to the frontend strictly use Prisma `select` projections.
- Internal DB `id`s, `authorIp`s, `authorVisits`, and full `viewerLog` data are meticulously stripped from the outgoing JSON. This ensures viewers cannot inspect the network tab and extract sensitive author data.
- API endpoints strictly use `.env` bound variables. No localhost fallbacks are allowed.

## 📦 Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure `.env`**
   ```env
   DATABASE_URL="mongodb+srv://<user>:<password>@cluster.mongodb.net/blank-page"
   PORT=5000
   ```

3. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

4. **Run Server**
   ```bash
   npm run dev
   ```

---
*For full project documentation and frontend integration, please see the primary `README.md` located in the root `/blank-page` directory.*

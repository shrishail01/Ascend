# ASCEND: AI Career Co-pilot & Operations Platform

Ascend is a modern, responsive enterprise SaaS application that optimizes resumes, simulates AI-driven mock interviews, scans keywords for ATS alignment, tracks active job applications, and builds custom career learning roadmaps.

## Architecture Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS, TanStack Query, Axios, Framer Motion.
- **Backend**: Express, TypeScript, Mongoose (MongoDB), Zod Validation, Winston logger.
- **AI Gateway**: Unified `@google/generative-ai` wrapper with safety settings, cost calculators, plan rate limits, and failure fallback retries.
- **Payments**: Razorpay Checkout API & automated webhooks signature validator.

---

## Getting Started

### 1. Prerequisites
- Node.js (v18.x recommended)
- MongoDB Database Instance

### 2. Environment Setup
Configure `.env` in the `backend/` directory:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/ascend
JWT_SECRET=your-secure-jwt-secret-key
JWT_REFRESH_SECRET=your-secure-refresh-token-secret-key
GEMINI_API_KEY=your-gemini-generative-ai-key
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret
```

Configure `.env` in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 3. Startup Commands

Start Backend:
```bash
cd backend
npm install
npm run dev
```

Start Frontend:
```bash
cd frontend
npm install
npm run dev
```

### 4. Running Mocks Verification Tests
Run automated service checks in `backend/`:
```bash
# Verify AI Gen & Context Builder
npx tsx src/services/ai/ai.test.ts

# Verify Razorpay Orders & Webhooks
npx tsx src/services/subscription.test.ts

# Verify Admin RBAC Permissions & Stats
npx tsx src/services/admin.test.ts
```

### 5. Running Containers Orchestration
Build and spin up the complete application container stack:
```bash
docker-compose up --build
```
The client page will be served on port `80` (http://localhost) and backend on port `5000`.

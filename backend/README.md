# Ascend - Backend Web Server

This is the Express TypeScript backend application for **Ascend**, your AI Career Partner.

## Project Structure

```text
src/
├── index.ts               # Server entry point
├── config/                # Environment and Database configuration
│   ├── env.ts             # Type-safe environment validation (Zod)
│   └── database.ts        # Database connection configurations
├── routes/                # Route definitions mapping logical controllers
│   ├── auth.ts            # Authentication & Profile routes
│   ├── resume.ts          # Resume builder routes
│   ├── ats.ts             # ATS scanner routes
│   ├── jobs.ts            # Job tracker routes
│   ├── coverLetter.ts     # Cover letter routes
│   ├── interview.ts       # Interview scoring routes
│   ├── roadmap.ts         # Roadmap timeline routes
│   ├── linkedin.ts        # LinkedIn profile review routes
│   ├── settings.ts        # Preference validation routes
│   └── dashboard.ts       # General analytics routes
├── controllers/           # Request/response validation handlers (Phase 2)
├── middleware/            # JWT validation and error handlers (Phase 2)
├── models/                # Mongoose schema definitions (Phase 2)
├── repositories/          # Mongoose CRUD abstraction (Phase 2)
├── validators/            # Zod validation schemas (Phase 2)
├── constants/             # Enums & static settings (Phase 2)
├── services/              # Gemini & PDF compilation (Phase 2)
└── utils/                 # General helpers (Phase 2)
```

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment variables template and configure them:
   ```bash
   cp .env.example .env
   ```

3. Run in development (watches for file changes):
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Run in production:
   ```bash
   npm run start
   ```

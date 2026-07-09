# Standalone Migration Plan & Risk Analysis (Target Stack: MERN + Vite)

This document outlines the migration strategy and refactoring reference to transition **Ascend** from the managed Zite platform to your specific standalone stack:
*   **Frontend**: React, Vite, TypeScript, Tailwind CSS (Hosted on Vercel)
*   **Backend**: Node.js, Express, TypeScript (Hosted on Render)
*   **Database**: MongoDB Atlas, Mongoose
*   **Authentication**: JWT (JSON Web Tokens) & Google OAuth
*   **Payments**: Razorpay
*   **AI**: Google Gemini API

---

## 1. Migration Risks and Mitigation Strategies

Migrating a platform-dependent app like Zite involves several technical challenges:

| Risk Category | Technical Challenge | Mitigation Strategy |
| :--- | :--- | :--- |
| **Proprietary SDKs** | Code imports from `zite-auth-sdk`, `zite-endpoints-sdk`, and `zite-integrations-backend-sdk` will fail. | Replace Zite SDK methods with standard HTTP request wrappers (`axios` / `fetch`) on the frontend, and standard Express controller handlers on the backend. |
| **Missing UI Code** | All `@/components/ui/` Shadcn components (Button, Dialog, Tabs, etc.) are missing from the export. | Scaffold a fresh Vite + Tailwind project, initialize Shadcn, and add the required components using the Shadcn CLI. |
| **Database Migration** | Zite database tables must be translated from their JSON structure into document-based MongoDB collections. | Create Mongoose schemas to represent the Users, Resumes, Cover Letters, Interview Sessions, Job Applications, and ATS Analyses models. |
| **Authentication** | Zite handles login sessions natively. | Set up a backend Passport.js middleware or custom Google OAuth exchange flow, issuing JWT tokens on successful logins. |
| **PDF Generation** | Zite exports PDF documents via `ZitePdf.renderHtml`. | Implement a server-side route in Express that uses Puppeteer (headless Chrome) or `html-pdf` to convert HTML to PDF and store the result. |
| **Hosting Split** | Zite hosts front-and-backend together under one project. | Configure Vercel to host the static SPA frontend, and Render to run the continuous Node.js backend. Configure CORS appropriately. |

---

## 2. Target Database Schema (Mongoose Models)

Below is the structured TypeScript definition for your Mongoose models mapping the Zite tables:

### 2.1 User Model (`src/models/User.ts`)
```typescript
import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  firstName?: string;
  lastName?: string;
  plan: 'Free' | 'Premium' | 'Admin';
  linkedInUrl?: string;
  currentRole?: string;
  targetRole?: string;
  aiCreditsUsed: number;
  featureUsage?: Record<string, number>;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  plan: { type: String, enum: ['Free', 'Premium', 'Admin'], default: 'Free' },
  linkedInUrl: { type: String },
  currentRole: { type: String },
  targetRole: { type: String },
  aiCreditsUsed: { type: Number, default: 0 },
  featureUsage: { type: Map, of: Number, default: {} },
  createdAt: { type: Date, default: Date.now },
});

export const User = model<IUser>('User', UserSchema);
```

### 2.2 Resume Model (`src/models/Resume.ts`)
```typescript
import { Schema, model, Document, Types } from 'mongoose';

export interface IResume extends Document {
  title: string;
  user: Types.ObjectId;
  template: string;
  content: string; // Stringified JSON holding ResumeContent schema
  atsScore?: number;
  status: 'Draft' | 'Published';
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>({
  title: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  template: { type: String, default: 'Modern' },
  content: { type: String, required: true }, // Parsed JSON format block
  atsScore: { type: Number },
  status: { type: String, enum: ['Draft', 'Published'], default: 'Draft' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Resume = model<IResume>('Resume', ResumeSchema);
```

---

## 3. Recommended Migration Phases

We recommend a 5-phase migration order:

```text
PHASE 1: Project Scaffolding
 ├── Create Vite SPA project + Tailwind configuration
 ├── Initialize Shadcn UI & install lucide-react, sonner, use-debounce
 └── Create Express TypeScript project + configure CORS

PHASE 2: Database & Authentication Configuration
 ├── Set up MongoDB Atlas cluster and connect via Mongoose
 ├── Implement Passport.js (Google OAuth strategy) on Express
 └── Configure JWT signing, token validation middlewares, and refresh tokens

PHASE 3: Backend API Development
 ├── Port 26 serverless files into Express Router middleware routes
 ├── Rewrite Zite ORM database queries to Mongoose queries
 ├── Configure Razorpay Node.js SDK and webhook handlers
 └── Refactor gemini.ts to use @google/generative-ai SDK

PHASE 4: Frontend UI Porting
 ├── Copy Page components into Vite's src/pages/ folder
 ├── Replace zite-endpoints-sdk functions with Axios HTTP calls
 └── Bind login checks and contexts to the JWT auth storage hook

PHASE 5: Hosting & Deployment
 ├── Deploy backend to Render, configuring Atlas IP access list
 └── Deploy static SPA frontend bundle to Vercel
```

---

## 4. Code Refactoring Reference

Below are code refactoring examples showing how to replace Zite's proprietary SDK calls with your target stack technologies.

### 4.1 Query Translation (Database Operations)
*   **Before (Zite Backend SDK)**:
    ```typescript
    import { Resumes } from 'zite-integrations-backend-sdk';
    const resume = await Resumes.findOne({ id: input.id });
    ```
*   **After (Mongoose)**:
    ```typescript
    import { Resume } from '../models/Resume';
    // Inside controller:
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    ```

### 4.2 Authentication Flow (Google OAuth & JWT)
On your Express server, implement endpoint routes for auth redirect and callback processing:

```typescript
import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User';

const router = express.Router();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0].value;
      if (!email) return done(new Error("No email returned from Google"));
      
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          email,
          firstName: profile.name?.givenName,
          lastName: profile.name?.familyName,
          plan: 'Free'
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Trigger google authentication page redirection
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback handler: issue JWT token on successful authentication
router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const user = req.user as any;
    const token = jwt.sign(
      { id: user._id, email: user.email, plan: user.plan },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    // Redirect to frontend dashboard with JWT token
    res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
  }
);
```

### 4.3 API Communication Translation (Frontend API Calls)
*   **Before (Zite Client Endpoints)**:
    ```typescript
    import { getResume } from 'zite-endpoints-sdk';
    const response = await getResume({ id });
    ```
*   **After (Axios client with bearer auth configuration)**:
    ```typescript
    import axios from 'axios';

    const api = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
    });

    api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    export const getResume = async (id: string) => {
      const { data } = await api.get(`/resumes/${id}`);
      return data;
    };
    ```

### 4.4 PDF Generation in Node/Express
Since Zite's PDF generation service is not available, implement a local renderer inside Express using Puppeteer:

```typescript
import puppeteer from 'puppeteer';
import { Response } from 'express';

export async function exportResumePdf(htmlContent: string, res: Response) {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'letter',
      margin: { top: '0.6in', right: '0.7in', bottom: '0.6in', left: '0.7in' }
    });
    
    await browser.close();
    
    // Set headers to trigger file download directly
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
}
```

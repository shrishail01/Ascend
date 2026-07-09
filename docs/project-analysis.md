# System Architecture & Project Analysis

This document provides a high-level overview of the **Ascend** project architecture, its component layout, routing, environment variables, and external integrations.

---

## 1. Project Overview
**Ascend** is an AI-powered career co-pilot application. It is designed to assist job seekers through a suite of tools including resume building and optimization, ATS (Applicant Tracking System) screening analysis, cover letter generation, interactive mock interview preparation, job application tracking, personalized career roadmapping, LinkedIn profile optimization, and portfolio project generation.

---

## 2. Directory Structure
After unpacking `Ascend.json` (the Zite export file), the codebase layout under [ascend/](file:///C:/Users/hirem/.gemini/antigravity/scratch/ascend) is structured as follows:

```text
ascend/
├── Ascend.json                  # Source Zite export (JSON)
├── tailwind.config.ts           # Tailwind CSS Configuration
├── zite.config.json             # Global Zite environment and integration config
├── zite.lock                    # Database table and field UUID mapping configurations
├── docs/                        # Project documentation (analysis and migration plans)
└── src/
    ├── App.tsx                  # Main router entry point
    ├── index.css                # Global CSS stylesheet (Tailwind directives & theme variables)
    ├── api/                     # Backend endpoint definitions (Cloudflare serverless-style handler files)
    │   ├── analyzeATS.ts
    │   ├── checkFeatureAccess.ts
    │   ├── createRazorpayOrder.ts
    │   ├── deleteCoverLetter.ts
    │   ├── deleteJobApplication.ts
    │   ├── deleteResume.ts
    │   ├── exportResumePdf.ts
    │   ├── generateCoverLetter.ts
    │   ├── generateInterviewQuestions.ts
    │   ├── generateRoadmap.ts
    │   ├── generateRoleSOP.ts
    │   ├── getCoverLetters.ts
    │   ├── getDashboardStats.ts
    │   ├── getResume.ts
    │   ├── getResumes.ts
    │   ├── getJobApplications.ts
    │   ├── optimizeResume.ts
    │   ├── optimizeResumeATS.ts
    │   ├── reviewLinkedIn.ts
    │   ├── saveJobApplication.ts
    │   ├── saveResume.ts
    │   ├── scoreInterview.ts
    │   ├── suggestProjects.ts
    │   ├── suggestRoles.ts
    │   ├── updateProfile.ts
    │   └── verifyRazorpayPayment.ts
    ├── components/              # Global React components
    │   ├── DashboardLayout.tsx  # Desktop sidebar and mobile header navigation layout
    │   └── UpgradeModal.tsx     # Payment/Razorpay initiation popup
    ├── hooks/                   # Custom React hooks
    │   └── useFeatureAccess.ts  # Plan-based usage/credits checking hook
    ├── lib/                     # Server-side business utility modules
    │   └── gemini.ts            # Helper module for calling Google Generative AI (Gemini 2.5)
    └── pages/                   # Frontend view components
        ├── AtsAnalyzer.tsx
        ├── CareerRoadmap.tsx
        ├── CoverLetterGenerator.tsx
        ├── Dashboard.tsx
        ├── InterviewPrep.tsx
        ├── JobTracker.tsx
        ├── LandingPage.tsx
        ├── LinkedInReview.tsx
        ├── ProjectGenerator.tsx
        ├── ResumeBuilder.tsx
        ├── ResumeEditor.tsx
        └── Settings.tsx
```

---

## 3. Technical Architecture
Ascend is designed as a full-stack JavaScript/TypeScript application hosted on the **Zite Platform**. Its architecture divides duties as follows:

*   **Frontend**: A React Single Page Application (SPA) driven by `react-router-dom`. UI components are built using Tailwind CSS styling and styled via standard Tailwind configuration tokens.
*   **Backend Serverless Functions**: Individual file-based endpoint handlers located under `src/api/`. These functions execute in a secure node-like serverless environment (comparable to Cloudflare Workers or Vercel Serverless Functions) with built-in access to database connectors, file upload streams, and environment variables.
*   **Data Tier**: A relational database layer mapped through the Zite integration engine. Relational interactions are performed using an ORM-like interface provided by the Zite SDK.
*   **AI Tier**: Integration with the Google Gemini API (`gemini-2.5-flash`) for multi-turn generative workloads, JSON outputs, and PDF parser indexing.

---

## 4. Route and Page Listing
Navigation is managed in [src/App.tsx](file:///C:/Users/hirem/.gemini/antigravity/scratch/ascend/src/App.tsx). Routes are divided into public views and dashboard views protected behind the `DashboardLayout` container:

| Path | Component | Layout | Protected | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `LandingPage` | None (Standalone) | No | Product overview, pricing plans, FAQs, and authentication triggers |
| `/dashboard` | `Dashboard` | `DashboardLayout` | Yes | Metrics overview, quick actions list, pipeline progress, and recent analyses |
| `/resumes` | `ResumeBuilder` | `DashboardLayout` | Yes | Management deck for resumes (Create, duplicate, delete list view) |
| `/resumes/:id` | `ResumeEditor` | `DashboardLayout` | Yes | Tabbed resume writer (personal info, experience, education, skills, projects) |
| `/ats-analyzer` | `AtsAnalyzer` | `DashboardLayout` | Yes | Upload or paste resumes to run scoring and obtain optimization recommendations |
| `/cover-letters` | `CoverLetterGenerator` | `DashboardLayout` | Yes | Job-specific cover letter drafts creator and listing view |
| `/interview-prep` | `InterviewPrep` | `DashboardLayout` | Yes | Generates mock questions based on role, conducts session, and scores answers |
| `/job-tracker` | `JobTracker` | `DashboardLayout` | Yes | Kanban board and list view mapping company applications from applied to offer |
| `/career-roadmap` | `CareerRoadmap` | `DashboardLayout` | Yes | Generates high-level career paths, matches skills, and outputs transition SOPs |
| `/linkedin-review` | `LinkedInReview` | `DashboardLayout` | Yes | Reviews Headline, About, and Experience section texts using generative AI |
| `/project-generator` | `ProjectGenerator` | `DashboardLayout` | Yes | Generates portfolio project ideas tailored to specific skills and target levels |
| `/settings` | `Settings` | `DashboardLayout` | Yes | Profile info updater (LinkedIn URL, target role, etc.) and plan status dashboard |

---

## 5. Environment Variables
Defined within [zite.config.json](file:///C:/Users/hirem/.gemini/antigravity/scratch/ascend/zite.config.json), the environment variables injected into the backend execution context are:

*   **`ZITE_GEMINI_API_KEY`**: Authenticates calls made to Google AI Studio's Gemini model API endpoints.
*   **`ZITE_RAZORPAY_KEY_ID`**: Public key loaded in both frontend checkouts and backend parameters to coordinate orders.
*   **`ZITE_RAZORPAY_KEY_SECRET`**: Private key used exclusively on the server side to verify webhook checkout signatures and complete orders.

---

## 6. Authentication Flow
The application's identity system is configured in [zite.config.json](file:///C:/Users/hirem/.gemini/antigravity/scratch/ascend/zite.config.json) under the `authentication` schema and accessed via the `useAuth()` hook from `zite-auth-sdk`:

1.  **Signup Access Mode**: Configured to `"open"`, allowing self-registration.
2.  **Allowed Methods**: Magic Link (`magicLink: true`) and Google Sign-In (`googleSignIn: true`). Single Sign-On (SSO) is disabled.
3.  **Redirection Guard**: In [DashboardLayout.tsx](file:///C:/Users/hirem/.gemini/antigravity/scratch/ascend/src/components/DashboardLayout.tsx), an effect monitors the loading state:
    ```typescript
    useEffect(() => {
      if (!isLoading && !user) loginWithRedirect({ redirectUrl: window.location.href });
    }, [isLoading, user, loginWithRedirect]);
    ```
4.  **Profile Syncing**: Enabled through the `userSync` directives in `zite.config.json`. When a user authenticates, their record is bound to the `Users` database table (ID `tatFA5oaJtF`) utilizing specific field links:
    *   Email: `email` (field UUID: `fxwvzVBjeCC`)
    *   First Name: `firstName` (field UUID: `f2AdzyvcZU7`)
    *   Last Name: `lastName` (field UUID: `fiGadHDGZex`)

---

## 7. External Integrations
Ascend makes structured calls to four major external service groups:

*   **Google Gemini API**: Accessed inside backend functions via `src/lib/gemini.ts`. Calls the `gemini-2.5-flash` model. Prompts configure specific response configurations (mostly forcing valid raw JSON) to power all intelligent career components.
*   **Razorpay API**: Handles monetary transactions to unlock the premium subscription plan. Front-end triggers load `checkout.js` from `https://checkout.razorpay.com/v1/checkout.js`. The backend initiates orders via `https://api.razorpay.com/v1/orders`.
*   **Zite PDF Service (`ZitePdf`)**: Converts formatted HTML templates into PDF documents. Handled by calling `ZitePdf.renderHtml` inside `exportResumePdf.ts`.
*   **Zite File Upload (`uploadFile`)**: Handles incoming user resume file storage streams. Used inside `AtsAnalyzer.tsx` to handle PDF/DOCX file uploads before parsing.

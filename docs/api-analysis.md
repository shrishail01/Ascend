# Backend Endpoint & API Analysis

This document provides a detailed breakdown of all 26 backend API endpoint handlers located under `src/api/`. Each section details the schema definition, operations, external services, and execution logic.

---

## 1. Directory Breakdown of Endpoints

Every API endpoint is created using the `createEndpoint` helper from `zite-integrations-backend-sdk` and exported as default. The inputs are validated using `zod` schemas.

### 1.1 `analyzeATS.ts`
*   **Authentication Required**: Yes
*   **Input Schema**:
    ```typescript
    z.object({
      resumeText: z.string().optional(),
      fileUrl: z.string().optional(),
      fileName: z.string().optional(),
      jobDescription: z.string().optional(),
    })
    ```
*   **Output Schema**:
    ```typescript
    z.object({
      id: z.string(),
      overallScore: z.number(),
      parsedResumeText: z.string(),
      categories: z.array(z.object({
        name: z.string(),
        score: z.number(),
        feedback: z.string(),
      })),
      keywords: z.object({
        found: z.array(z.string()),
        missing: z.array(z.string()),
      }),
      recommendations: z.array(z.string()),
    })
    ```
*   **Database Operations**:
    *   Creates a record in `AtsAnalyses` (`AtsAnalyses.create`) mapping `title`, `user`, `matchScore`, `resumeText`, `jobDescription`, serialized `analysisData` (JSON format string), and `recommendations` (new-line separated list).
*   **Generative AI (Gemini)**:
    *   **PDF Extraction**: If `fileUrl` points to a PDF, runs multimodal Gemini (`callGeminiWithFile`) to extract raw text with the system instruction: *"You are a document parser. Extract complete text content from resumes accurately, preserving all details and structure."*
    *   **ATS Compatibility Analysis**: Feeds the raw text of the resume and job description to `callGeminiJSON`. System instruction: *"You are an expert ATS resume analyst. Analyze resumes for ATS compatibility and provide actionable, specific feedback."*
    *   **JSON Shape Forced**: Returns `overallScore`, `categories` list (Formatting, Keywords, Sections, Readability, Impact, Grammar), `keywords` matching arrays, and `recommendations`.
*   **Word Document Parsing**: Handled locally via `extractTextFromDocx` helper, which parses docx/doc binary streams as text by mapping XML node tags matching `<w:t[^>]*>([^<]*)<\/w:t>`.

### 1.2 `checkFeatureAccess.ts`
*   **Authentication Required**: Yes
*   **Input Schema**:
    ```typescript
    z.object({
      feature: z.string(),
      increment: z.boolean().optional(),
    })
    ```
*   **Output Schema**:
    ```typescript
    z.object({
      allowed: z.boolean(),
      usageCount: z.number(),
      limit: z.number(),
      isPremium: z.boolean(),
    })
    ```
*   **Database Operations**:
    *   `Users.update`: Modifies `featureUsage` JSON object.
    *   Counts total database items for `resume`, `ats`, `coverLetter`, and `interview` features using `Resumes.findAll`, `AtsAnalyses.findAll`, `CoverLetters.findAll`, and `InterviewSessions.findAll` with user-based filters.
*   **Execution Logic**:
    *   Free limit is set to `2`. If the user is premium (`Premium` or `Admin`), always permits access. For database-backed items, count records. For virtual items (roadmap, linkedin, projects), read counts from the `featureUsage` field on the `Users` table and update it.

### 1.3 `createRazorpayOrder.ts`
*   **Authentication Required**: Yes
*   **Input Schema**: `z.object({})`
*   **Output Schema**:
    ```typescript
    z.object({
      orderId: z.string(),
      amount: z.number(),
      currency: z.string(),
      keyId: z.string(),
      userName: z.string(),
      userEmail: z.string(),
    })
    ```
*   **External Integration**:
    *   Initiates payment order by posting basic authorization credentials (base64 of `ZITE_RAZORPAY_KEY_ID` and `ZITE_RAZORPAY_KEY_SECRET`) to `https://api.razorpay.com/v1/orders`.
*   **Parameters**:
    *   Price: ₹89.00 (`amount: 8900` paise).
    *   Currency: `INR`.
    *   Metadata Notes: `userId`, `userEmail`, `plan: 'Premium'`.

### 1.4 `verifyRazorpayPayment.ts`
*   **Authentication Required**: Yes
*   **Input Schema**:
    ```typescript
    z.object({
      razorpayOrderId: z.string(),
      razorpayPaymentId: z.string(),
      razorpaySignature: z.string(),
    })
    ```
*   **Output Schema**:
    ```typescript
    z.object({
      success: z.boolean(),
      plan: z.string(),
    })
    ```
*   **Database Operations**:
    *   `Users.update`: Updates the user's `plan` column value to `"Premium"`.
*   **Signature Verification**:
    *   Recomputes signature inside Cloudflare Workers runtime environment via the Web Crypto API HMAC SHA-256 algorithm. Sign key matches `ZITE_RAZORPAY_KEY_SECRET`. Payload matches `${orderId}|${paymentId}`. Checks that computed hex value matches incoming signature string.

### 1.5 `getResume.ts` / `getResumes.ts`
*   **Authentication Required**: Yes
*   **Database Operations**:
    *   `getResume.ts`: Searches for a record using `Resumes.findOne({ id: input.id })`.
    *   `getResumes.ts`: Searches for a user's list of records using `Resumes.findAll({ filters: { user: context.user.id } })`.

### 1.6 `saveResume.ts`
*   **Authentication Required**: Yes
*   **Input Schema**:
    ```typescript
    z.object({
      id: z.string().optional(),
      title: z.string(),
      template: z.string(),
      content: z.string(),
      status: z.string().optional(),
    })
    ```
*   **Database Operations**:
    *   Updates existing record: `Resumes.update({ id, record })`.
    *   Creates a new record: `Resumes.create({ record })` setting status defaults to `'Draft'`.

### 1.7 `deleteResume.ts`
*   **Authentication Required**: Yes
*   **Database Operations**:
    *   Removes record from system: `Resumes.delete({ id: input.id })`.

### 1.8 `optimizeResume.ts`
*   **Authentication Required**: Yes
*   **Input Schema**:
    ```typescript
    z.object({
      bulletPoints: z.array(z.string()),
      targetRole: z.string().optional(),
      industry: z.string().optional(),
    })
    ```
*   **Output Schema**:
    ```typescript
    z.object({
      optimized: z.array(z.object({
        original: z.string(),
        improved: z.string(),
        changes: z.string(),
      })),
    })
    ```
*   **Generative AI (Gemini)**:
    *   Calls `callGeminiJSON` to rewrite array bullet points. System instruction: *"You are an expert resume writer. Optimize bullet points for ATS systems with quantifiable achievements and strong action verbs."*

### 1.9 `optimizeResumeATS.ts`
*   **Authentication Required**: Yes
*   **Input Schema**:
    ```typescript
    z.object({
      resumeText: z.string(),
      jobDescription: z.string().optional(),
    })
    ```
*   **Output Schema**:
    ```typescript
    z.object({
      optimizedText: z.string(),
      pdfUrl: z.string(),
      sections: z.object({
        fullName: z.string(),
        title: z.string(),
        email: z.string(),
        phone: z.string(),
        location: z.string(),
        linkedIn: z.string(),
        summary: z.string(),
        experience: z.array(z.object({
          jobTitle: z.string(),
          company: z.string(),
          duration: z.string(),
          bullets: z.array(z.string()),
        })),
        education: z.array(z.object({
          degree: z.string(),
          school: z.string(),
          year: z.string(),
        })),
        skills: z.array(z.string()),
        projects: z.array(z.object({
          name: z.string(),
          description: z.string(),
        })),
      }),
    })
    ```
*   **Generative AI (Gemini)**:
    *   Calls `callGeminiJSON` to reconstruct the resume structure. System instruction: *"You are an elite resume writer who creates ATS-optimized, professional resumes that pass automated screening systems."*
*   **Database Operations**:
    *   Saves the optimized output as a new record in the `Resumes` database:
        *   `title`: `"ATS Optimized Resume - [Current Date]"`
        *   `content`: Serialized JSON representation matching `ResumeContent` shape.
        *   `status`: `"Draft"`
    *   Invokes internal API handler `exportResumePdf` (by importing it locally or triggering pdf generator) to obtain a public URL.

### 1.10 `exportResumePdf.ts`
*   **Authentication Required**: Yes
*   **Input Schema**: `z.object({ id: z.string() })`
*   **Output Schema**: `z.object({ url: z.string() })`
*   **Database Operations**:
    *   Fetches the resume: `Resumes.findOne({ id: input.id })`.
*   **External Integration (ZitePdf)**:
    *   Parses resume content JSON, escapes characters to block raw HTML injection, structures content into a single standard HTML/CSS template (styled with tight margin, Helvetica Neue typography, blue section headers, and inline flex skill list badges), and sends the HTML markup stream to `ZitePdf.renderHtml`. Returns a hosted PDF link.

### 1.11 `suggestRoles.ts`
*   **Authentication Required**: Yes
*   **Input Schema**: `z.object({})`
*   **Output Schema**:
    ```typescript
    z.object({
      roles: z.array(z.object({
        title: z.string(),
        matchScore: z.number(),
        demand: z.string(),
        avgSalary: z.string(),
        justification: z.string(),
        keySkillsMatched: z.array(z.string()),
        skillGaps: z.array(z.string()),
      })),
      profileSummary: z.string(),
    })
    ```
*   **Database Operations**:
    *   Queries `Resumes.findAll` (gets latest resume content).
    *   Queries `AtsAnalyses.findAll` (falls back to parse raw text if no builder resume is found).
*   **Generative AI (Gemini)**:
    *   Combines current role, target role interest, and resume text to recommend top 5 job roles in 2025-2026. System instruction: *"You are a career strategist with deep knowledge of current job market trends, in-demand roles, and career transitions. Provide realistic, data-informed recommendations."*

### 1.12 `generateRoleSOP.ts`
*   **Authentication Required**: Yes
*   **Input Schema**:
    ```typescript
    z.object({
      targetRole: z.string(),
      matchScore: z.number().optional(),
      skillGaps: z.array(z.string()).optional(),
    })
    ```
*   **Output Schema**:
    ```typescript
    z.object({
      sop: z.object({
        targetRole: z.string(),
        estimatedTimeline: z.string(),
        overview: z.string(),
        phases: z.array(z.object({
          phase: z.number(),
          title: z.string(),
          duration: z.string(),
          objective: z.string(),
          steps: z.array(z.object({
            step: z.number(),
            action: z.string(),
            details: z.string(),
            resource: z.string(),
            deliverable: z.string(),
          })),
        })),
        certifications: z.array(z.object({
          name: z.string(),
          provider: z.string(),
          difficulty: z.string(),
        })),
        projectsToBuild: z.array(z.object({
          title: z.string(),
          description: z.string(),
          difficulty: z.string(),
        })),
      }),
    })
    ```
*   **Database Operations**:
    *   Queries `Resumes.findAll` and `AtsAnalyses.findAll` to collect candidate profile context.
*   **Generative AI (Gemini)**:
    *   System instruction: *"You are an elite career coach who creates detailed, no-fluff action plans. Every recommendation must be specific, practical, and include real resources. No vague advice."*
    *   Generates a structured, phased transition plan to reach the target role.

### 1.13 `generateRoadmap.ts`
*   **Authentication Required**: Yes
*   **Input Schema**:
    ```typescript
    z.object({
      currentRole: z.string(),
      targetRole: z.string(),
      skills: z.string().optional(),
      experience: z.string().optional(),
    })
    ```
*   **Output Schema**:
    ```typescript
    z.object({
      roadmap: z.object({
        summary: z.string(),
        timelineMonths: z.number(),
        skillGaps: z.array(z.object({ skill: z.string(), priority: z.string(), resources: z.string() })),
        milestones: z.array(z.object({ month: z.number(), title: z.string(), description: z.string(), actionItems: z.array(z.string()) })),
        salaryRange: z.object({ current: z.string(), target: z.string() }),
      }),
    })
    ```
*   **Generative AI (Gemini)**:
    *   System instruction: *"You are a career advisor. Create realistic, actionable career roadmaps with specific timelines and resources."*
    *   Generates a custom timeline roadmap mapping goals monthly.

### 1.14 `reviewLinkedIn.ts`
*   **Authentication Required**: Yes
*   **Input Schema**:
    ```typescript
    z.object({
      headline: z.string().optional(),
      about: z.string().optional(),
      experience: z.string().optional(),
    })
    ```
*   **Output Schema**:
    ```typescript
    z.object({
      overallScore: z.number(),
      sections: z.array(z.object({
        name: z.string(),
        score: z.number(),
        current: z.string(),
        improved: z.string(),
        tips: z.string(),
      })),
    })
    ```
*   **Generative AI (Gemini)**:
    *   System instruction: *"You are a LinkedIn optimization expert. Provide specific, actionable improvements with keyword optimization."*
    *   Scores and returns rewrite variations for each supplied section.

### 1.15 `generateInterviewQuestions.ts`
*   **Authentication Required**: Yes
*   **Input Schema**:
    ```typescript
    z.object({
      jobTitle: z.string(),
      company: z.string().optional(),
      type: z.enum(['hr', 'technical', 'behavioral']),
    })
    ```
*   **Output Schema**:
    ```typescript
    z.object({
      id: z.string(),
      questions: z.array(z.object({
        question: z.string(),
        tips: z.string(),
        sampleAnswer: z.string(),
      })),
    })
    ```
*   **Database Operations**:
    *   `InterviewSessions.create`: Stores new simulation with `title`, `user`, `jobTitle`, `company`, `type`, stringified `questionsData` JSON, default score as `0`, and empty feedback.
*   **Generative AI (Gemini)**:
    *   System instruction: *"You are an expert interview coach. Generate realistic, role-specific interview questions with actionable tips and strong sample answers."*
    *   Generates 5 context-specific interview questions.

### 1.16 `scoreInterview.ts`
*   **Authentication Required**: Yes
*   **Input Schema**:
    ```typescript
    z.object({
      sessionId: z.string(),
      answers: z.array(z.object({
        question: z.string(),
        answer: z.string(),
      })),
    })
    ```
*   **Output Schema**:
    ```typescript
    z.object({
      overallScore: z.number(),
      feedback: z.string(),
      questionFeedback: z.array(z.object({
        score: z.number(),
        strengths: z.string(),
        improvements: z.string(),
      })),
    })
    ```
*   **Database Operations**:
    *   `InterviewSessions.update`: Updates the session record setting `score` and `feedback` based on model results.
*   **Generative AI (Gemini)**:
    *   System instruction: *"You are an expert interview coach. Provide constructive, actionable feedback on interview answers."*
    *   Evaluates responses to generate overall feedback and question-level breakdowns.

### 1.17 `generateCoverLetter.ts`
*   **Authentication Required**: Yes
*   **Input Schema**:
    ```typescript
    z.object({
      jobTitle: z.string(),
      company: z.string(),
      jobDescription: z.string(),
      resumeText: z.string().optional(),
      tone: z.string().optional(),
    })
    ```
*   **Output Schema**:
    ```typescript
    z.object({
      id: z.string(),
      content: z.string(),
    })
    ```
*   **Database Operations**:
    *   `CoverLetters.create`: Inserts a new record containing the generated output, user link, company, and title.
*   **Generative AI (Gemini)**:
    *   System instruction: *"You are an expert career coach who writes compelling, personalized cover letters that get interviews."*
    *   Generates a professional cover letter matching the specified tone.

### 1.18 `getCoverLetters.ts` / `deleteCoverLetter.ts`
*   **Database Operations**:
    *   `getCoverLetters.ts`: Queries `CoverLetters.findAll` filtered by user ID.
    *   `deleteCoverLetter.ts`: Removes matching letter using `CoverLetters.delete`.

### 1.19 `suggestProjects.ts`
*   **Authentication Required**: Yes
*   **Input Schema**:
    ```typescript
    z.object({
      skills: z.string(),
      targetRole: z.string().optional(),
      level: z.string().optional(),
    })
    ```
*   **Output Schema**:
    ```typescript
    z.object({
      projects: z.array(z.object({
        title: z.string(),
        description: z.string(),
        skills: z.array(z.string()),
        difficulty: z.string(),
        timeEstimate: z.string(),
        githubIdea: z.string(),
      })),
    })
    ```
*   **Generative AI (Gemini)**:
    *   System instruction: *"You are a senior developer and career advisor. Suggest impressive, practical portfolio projects that demonstrate real skills to employers."*
    *   Generates 6 custom portfolio project ideas.

### 1.20 `getDashboardStats.ts`
*   **Authentication Required**: Yes
*   **Database Operations**:
    *   Executes parallel queries:
        *   `Resumes.findAll` (gets resume count and calculates average ATS scores)
        *   `JobApplications.findAll` (counts job applications and groups them by status)
        *   `CoverLetters.findAll` (counts cover letters)
        *   `InterviewSessions.findAll` (counts mock interviews and calculates average interview scores)
        *   `AtsAnalyses.findAll` (fetches the 5 most recent ATS analyses)

### 1.21 `getJobApplications.ts` / `saveJobApplication.ts` / `deleteJobApplication.ts`
*   **Database Operations**:
    *   `getJobApplications.ts`: Queries `JobApplications.findAll` filtered by user ID.
    *   `saveJobApplication.ts`: Performs `JobApplications.update` or `JobApplications.create` with schema inputs.
    *   `deleteJobApplication.ts`: Performs `JobApplications.delete`.

### 1.22 `updateProfile.ts`
*   **Database Operations**:
    *   `Users.update`: Updates fields (`firstName`, `lastName`, `linkedInUrl`, `currentRole`, `targetRole`) on the authenticated user's record.

---

## 2. Frontend Client Calls Map

In the client application, API interactions are imported as typed functions from `'zite-endpoints-sdk'` instead of using standard HTTP client libraries (e.g., `axios` or `fetch`):

| Page Component | Event Handler / Trigger | SDK Function Call | Expected Payload |
| :--- | :--- | :--- | :--- |
| `AtsAnalyzer.tsx` | `handleAnalyze` | `analyzeATS` | `{ resumeText?, fileUrl?, fileName?, jobDescription? }` |
| `AtsAnalyzer.tsx` | `handleOptimize` | `optimizeResumeATS` | `{ resumeText, jobDescription? }` |
| `CareerRoadmap.tsx` | `handleSuggest` | `suggestRoles` | `{}` |
| `CareerRoadmap.tsx` | `handleSelectRole` | `generateRoleSOP` | `{ targetRole, matchScore, skillGaps }` |
| `CareerRoadmap.tsx` | `handleGenerate` | `generateRoadmap` | `{ currentRole, targetRole, skills?, experience? }` |
| `CoverLetterGenerator.tsx` | `handleGenerate` | `generateCoverLetter` | `{ jobTitle, company, jobDescription, resumeText?, tone? }` |
| `CoverLetterGenerator.tsx` | `useEffect` | `getCoverLetters` | `{}` |
| `CoverLetterGenerator.tsx` | `handleDelete` | `deleteCoverLetter` | `{ id }` |
| `Dashboard.tsx` | `useEffect` | `getDashboardStats` | `{}` |
| `InterviewPrep.tsx` | `handleGenerate` | `generateInterviewQuestions` | `{ jobTitle, company?, type }` |
| `InterviewPrep.tsx` | `handleScore` | `scoreInterview` | `{ sessionId, answers: [{ question, answer }] }` |
| `JobTracker.tsx` | `useEffect` | `getJobApplications` | `{}` |
| `JobTracker.tsx` | `handleSave` | `saveJobApplication` | `{ id?, company, role, jobUrl?, status, salary?, notes?, appliedDate?, reminderDate? }` |
| `JobTracker.tsx` | `handleDelete` | `deleteJobApplication` | `{ id }` |
| `LinkedInReview.tsx` | `handleReview` | `reviewLinkedIn` | `{ headline?, about?, experience? }` |
| `ProjectGenerator.tsx` | `handleGenerate` | `suggestProjects` | `{ skills, targetRole?, level? }` |
| `ResumeBuilder.tsx` | `useEffect` | `getResumes` | `{}` |
| `ResumeBuilder.tsx` | `handleCreate` | `saveResume` | `{ title, template, content }` |
| `ResumeBuilder.tsx` | `handleDelete` | `deleteResume` | `{ id }` |
| `ResumeEditor.tsx` | `useEffect` | `getResume` | `{ id }` |
| `ResumeEditor.tsx` | `handleSave` | `saveResume` | `{ id, title, template, content }` |
| `ResumeEditor.tsx` | `handleExport` | `exportResumePdf` | `{ id }` |
| `Settings.tsx` | `handleSave` | `updateProfile` | `{ firstName, lastName, linkedInUrl?, currentRole?, targetRole? }` |
| `UpgradeModal.tsx` | `handleUpgrade` | `createRazorpayOrder` | `{}` |
| `UpgradeModal.tsx` | `handleUpgrade` | `verifyRazorpayPayment` | `{ razorpayOrderId, razorpayPaymentId, razorpaySignature }` |

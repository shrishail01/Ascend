# Platform SDK & Dependency Analysis

This document details the dependencies of **Ascend**, highlighting the differences between proprietary Zite Platform SDK modules and standard open-source libraries, and lists the files missing from the Zite project export.

---

## 1. Proprietary Zite Platform SDKs

The application relies on several Zite platform SDK packages to manage authentication, file uploads, database queries, and backend API handlers:

### 1.1 `zite-auth-sdk`
Used in the frontend application to manage user authentication:
*   **Exports**: `useAuth` hook.
*   **State variables returned**: `user` object, `isLoading` boolean.
*   **Helper methods returned**: `loginWithRedirect({ redirectUrl })` and `logout()`.
*   **User properties**: Includes `email`, `firstName`, `lastName`, `plan`, `linkedInUrl`, `currentRole`, `targetRole`, and `featureUsage`.

### 1.2 `zite-endpoints-sdk`
The communication link between the React frontend and the serverless backend functions:
*   **Exports**: Typed async functions mapping to filenames under `src/api/` (e.g., `getDashboardStats`, `analyzeATS`, `saveResume`).
*   **Behavior**: At build time, the platform compile these functions into RPC fetch calls.

### 1.3 `zite-integrations-backend-sdk`
The core framework for the serverless backend endpoints:
*   **Exports**:
    *   `createEndpoint`: Function wrapper that defines request parameters, Zod validation schemas, and execution contexts.
    *   **Database Tables Models**: ORM-like connectors (`Users`, `Resumes`, `JobApplications`, `CoverLetters`, `InterviewSessions`, `AtsAnalyses`) providing database CRUD methods.
    *   `ZitePdf`: Utility module that exposes `ZitePdf.renderHtml({ html, filename })` to render and return hosted PDF URLs.
*   **Context Interface**:
    *   Provides user context inside handlers: `context.user` (synced profile data).

### 1.4 `zite-file-upload-sdk`
Used in frontend pages to upload documents:
*   **Exports**: `uploadFile` function.
*   **Usage**: Takes the file object and filename, streams the data to Zite's file storage, and returns a public URL:
    ```typescript
    const { fileUrl } = await uploadFile({ data: file, filename: file.name });
    ```

---

## 2. Standard Open Source Dependencies

The application uses standard libraries for validation, layout, icons, styling, and navigation:

*   **`react`** & **`react-dom`**: Core frontend library.
*   **`react-router-dom`**: Manages routing and layout navigation.
*   **`zod`**: Schema-based validation for backend input and output parameters.
*   **`lucide-react`**: Vector icons.
*   **`sonner`**: Toast notification overlay system.
*   **`use-debounce`**: Debouncing input saves (used for resume builder autosaving).
*   **`tailwindcss`** & **`tailwindcss-animate`**: Responsive grid styling, borders, colors, and layout transitions.

---

## 3. Missing Infrastructure & Code Files

Because Zite is an all-in-one managed platform, the export file (`Ascend.json`) **excludes** the files required to run, build, or compile the project locally:

### 3.1 Project Scaffolding
*   **`package.json` / `package-lock.json`**: No package configurations are provided. This means developers must manually reconstruct all dependencies, scripts, and package locks.
*   **`tsconfig.json`**: TypeScript rules, path mappings (like `@/*` to `src/*`), and module resolution settings are missing.
*   **`vite.config.ts`**: The bundler configuration file is missing. This is needed to handle Tailwind compilation, routing plugins, and path aliases.

### 3.2 HTML Entry Point
*   **`index.html`**: The root HTML file containing the application mounting node (`<div id="root">`) and main script imports is missing.

### 3.3 UI Components Directory
*   **`src/components/ui/`**: All Shadcn components imported by the frontend are **missing**. This includes the source files for components like Button, Input, Progress, Dialog, Alert-Dialog, Sheet, Dropdown-Menu, etc.

### 3.5 Database & Backend Router Setup
*   **API Router & Controllers**: There is no Express or Node web server wrapper to receive API endpoint calls (e.g. `/api/resumes`) and trigger the matching files in `src/api/*`.
*   **Database Config**: No configuration or connector files are defined to register a MongoDB Atlas cluster database connection via Mongoose.
*   **Context Middleware**: The local environment lacks the middleware needed to parse incoming JWT headers, retrieve the associated user record from the MongoDB database, and inject it as `context.user` into the backend handler functions.

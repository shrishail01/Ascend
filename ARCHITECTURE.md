# System Architecture & Data Blueprints

This document outlines the core structural blocks, schemas mapping, and AI flows of the Ascend platform.

---

## 1. System Topology Overview

```mermaid
graph TD
    Client[React Frontend - Vite]
    Backend[Express Backend - TS]
    DB[(MongoDB Atlas)]
    Gemini[Google Gemini AI API]
    Razorpay[Razorpay Payment API]

    Client -- HTTPS / REST --> Backend
    Backend -- Mongoose --> DB
    Backend -- SDK HTTPS --> Gemini
    Backend -- Webhooks / Checkout --> Razorpay
```

- **Client SPA**: Connects to the backend APIs using Axios. Enforces responsive layouts, theme styling preferences, and offline drafts fallback caching (Dexie.js).
- **Backend Monolith**: Manages JWT refreshes, checks feature access counts, intercepts routes using RBAC middleware, and directs external traffic.

---

## 2. Core Database Schema Blueprints

### User
- Stores primary metadata (names, target role keywords) and role assignments (`User`, `SuperAdmin`, `Admin`, `Support`, `Moderator`, `Finance`).

### Subscription
- Records active packages (`Free`, `Pro`, `Premium`), renewal dates, and billing histories (invoice objects).

### FeatureUsage
- Tracks monthly credit consumption bounds per user per feature.

### AuditLog
- Security audit logs containing request correlation IDs, IP headers, actions details, and timestamps.

### SupportTicket
- Stores priority tiers (`low`, `medium`, `high`, `critical`), resolution states, internal admin notes, and ticket assignees.

### SystemConfig
- Singleton document managing maintenance toggles, prompt versions performance lists, and dynamic Gemini temperature parameters.

---

## 3. Central AI Gateway Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Middleware as checkFeatureAccess
    participant Gateway as AIGateway
    participant Cache as CacheService
    participant Gemini as Gemini AI API
    participant Audit as AuditLog

    User->>Middleware: Request AI Generation
    Middleware->>Middleware: Read subscription limit count
    alt Monthly Limit Exceeded
        Middleware-->>User: Throw 403 (Limit Reached)
    else Limit OK
        Middleware->>Gateway: Forward parameters
        Gateway->>Cache: Check SHA-256 Prompt hash
        alt Cache Hit
            Cache-->>Gateway: Return cached response
            Gateway-->>User: Return content (Latencies 10ms)
        else Cache Miss
            Gateway->>Gemini: Request Generative Output
            Gemini-->>Gateway: Return raw JSON string
            Gateway->>Gateway: Zod Parse & Validate Schema
            alt Schema Parsing OK
                Gateway->>Cache: Save generated content
                Gateway->>Audit: Log tokens count, estimated cost, & execution latency
                Gateway-->>User: Return verified JSON
            else Schema Parsing Error
                Gateway->>Gateway: Auto-Retry Generative request (1x)
            end
        end
    end
```
- Coordinates rate limits, handles automatic retry fallbacks, parses schema outputs, and maps logs to the MongoDB collections.

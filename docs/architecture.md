# MindVault AI — Architecture

## System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Cloud Run Container                    │
│                                                          │
│  ┌─────────────────────┐  ┌────────────────────────────┐ │
│  │   Static Frontend   │  │     Express.js Backend     │ │
│  │   (React + Vite)    │  │                            │ │
│  │                     │  │  ┌──────────────────────┐  │ │
│  │  Landing            │  │  │   Auth Middleware     │  │ │
│  │  Login              │  │  │  (Firebase Admin SDK) │  │ │
│  │  Dashboard          │  │  └──────────────────────┘  │ │
│  │  Journal            │  │                            │ │
│  │  Insights           │  │  ┌──────────────────────┐  │ │
│  │  Memory             │  │  │   Route Handlers     │  │ │
│  │  Security Center    │  │  │  /api/sessions       │  │ │
│  │  Settings           │  │  │  /api/chat           │  │ │
│  │  Search             │  │  │  /api/insights       │  │ │
│  │                     │  │  │  /api/memories       │  │ │
│  │  Firebase Auth SDK  │  │  │  /api/search         │  │ │
│  │  (ID Token)         │  │  │  /api/security       │  │ │
│  └─────────────────────┘  │  └──────────────────────┘  │ │
│                           │                            │ │
│                           │  ┌──────────────────────┐  │ │
│                           │  │   Gemini Service     │  │ │
│                           │  │  Multi-turn chat     │  │ │
│                           │  │  Insight extraction  │  │ │
│                           │  │  Session summary     │  │ │
│                           │  └──────────────────────┘  │ │
│                           │                            │ │
│                           │  ┌──────────────────────┐  │ │
│                           │  │   Firestore Service  │  │ │
│                           │  │  users/{uid}/...     │  │ │
│                           │  └──────────────────────┘  │ │
│                           └────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
         │                        │                │
         │                        │                │
    ┌────┴────┐          ┌────────┴─────┐   ┌─────┴──────┐
    │ Firebase │          │   Gemini API  │   │  Secret    │
    │  Auth    │          │   (via SDK)   │   │  Manager   │
    └─────────┘          └──────────────┘   └────────────┘
         │                                       │
    ┌────┴────┐                            ┌─────┴──────┐
    │Firestore │                            │GEMINI_API_ │
    │ Database │                            │   KEY      │
    └─────────┘                            └────────────┘
```

## Data Flow: Chat Message

1. User types message in React frontend
2. Firebase SDK provides current user's ID token
3. Frontend sends POST /api/chat with Bearer token
4. Express auth middleware verifies token via Firebase Admin SDK
5. Verified UID attached to req.user.uid
6. Session history loaded from Firestore (users/{uid}/sessions/{sessionId}/messages)
7. Active memories loaded from Firestore (users/{uid}/memories where active=true)
8. Gemini API key retrieved from Secret Manager (cached)
9. System prompt + memory context + conversation history sent to Gemini
10. Gemini response validated and saved to Firestore
11. Response returned to frontend

## Data Flow: Insight Extraction

1. User clicks "Summarize" on a session
2. All messages for the session are loaded
3. Gemini generates a text summary
4. Gemini generates structured JSON insights (goals, decisions, actions, patterns)
5. JSON output validated with Zod schema
6. On validation failure: retry once with same prompt
7. Validated insights saved to Firestore (users/{uid}/insights/{insightId})
8. Session updated with summary and insight reference

## Security Layers

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Transport | HTTPS (Cloud Run) | Encrypted in transit |
| Authentication | Firebase Auth | Identity verification |
| Authorization | Auth middleware | Token verification, UID extraction |
| Data isolation | Firestore rules + backend checks | Per-user data scoping |
| API security | Helmet, CORS, rate limiting | HTTP-level protections |
| Secret management | Cloud Secret Manager | Gemini API key protection |
| Input validation | Zod schemas | Request/response validation |
| Output validation | Zod schemas | Gemini output validation |
| Prompt security | System/user content separation | Prompt injection defense |
| Logging | Pino with redaction | Sensitive data never logged |
| Error handling | Centralized handler | Stack traces never exposed |

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend | React | 19.x |
| Build tool | Vite | 6.x |
| CSS | Tailwind CSS | 4.x |
| Icons | Lucide React | latest |
| Backend | Express.js | 4.x |
| Runtime | Node.js | 20.x |
| Auth | Firebase Auth + Admin SDK | 13.x |
| Database | Cloud Firestore | via Admin SDK |
| AI | Google Gemini (2.0 Flash) | via @google/generative-ai |
| Secrets | Cloud Secret Manager | 5.x |
| Validation | Zod | 3.x |
| Logging | Pino | 9.x |
| Rate Limiting | express-rate-limit | 7.x |
| Security Headers | Helmet | 8.x |
| Deployment | Cloud Run | managed |
| Container | Docker (multi-stage) | node:20-alpine |

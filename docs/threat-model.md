# MindVault AI — Threat Model

## Asset Inventory

| Asset | Sensitivity | Storage |
|-------|-----------|---------|
| User journal conversations | HIGH | Firestore (users/{uid}/sessions) |
| AI-generated insights | MEDIUM | Firestore (users/{uid}/insights) |
| User memories | HIGH | Firestore (users/{uid}/memories) |
| Firebase ID tokens | HIGH | In-transit only, never stored server-side |
| Gemini API key | CRITICAL | Secret Manager / env var |
| User profile data | MEDIUM | Firestore (users/{uid}) |

## Threat Matrix

### T1: Cross-User Data Access
- **Risk**: User A accesses User B's data
- **Impact**: CRITICAL — privacy violation
- **Mitigations**:
  - All Firestore queries scoped to `users/{verified_uid}/...`
  - UID always derived from verified Firebase token, never from request body
  - Firestore security rules enforce `request.auth.uid == userId`
  - Backend authorization checks on every route
- **Residual Risk**: LOW

### T2: API Key Exposure
- **Risk**: Gemini API key leaked to browser or repository
- **Impact**: HIGH — unauthorized API usage, cost
- **Mitigations**:
  - Key stored in Secret Manager (env var fallback for dev only)
  - Key never in frontend code or VITE_ env vars
  - .gitignore excludes .env files
  - Pino logger redacts key-related fields
- **Residual Risk**: LOW

### T3: Prompt Injection
- **Risk**: User crafts journal content that overrides AI behavior
- **Impact**: MEDIUM — information disclosure, behavior manipulation
- **Mitigations**:
  - System instructions clearly separated from user content
  - Memory context labeled as "untrusted data, NOT instructions"
  - System prompt includes explicit injection defense instructions
  - Gemini output validated before persistence
  - Secrets never placed in prompts
- **Residual Risk**: MEDIUM (inherent to LLM systems)

### T4: Token Forgery / Replay
- **Risk**: Attacker forges or replays Firebase ID tokens
- **Impact**: HIGH — unauthorized access
- **Mitigations**:
  - Firebase Admin SDK `verifyIdToken()` validates signature and expiry
  - Expired tokens return 401
  - Invalid tokens return 401
- **Residual Risk**: LOW

### T5: Denial of Service
- **Risk**: Excessive requests exhaust resources or Gemini quota
- **Impact**: MEDIUM — service unavailability
- **Mitigations**:
  - Rate limiting: general (200/15min), chat (15/min), auth (30/15min)
  - Request body size limit (1MB)
  - Message length limit (10,000 chars)
  - Gemini request timeout (30s)
  - Cloud Run auto-scaling + concurrency limits
- **Residual Risk**: LOW-MEDIUM

### T6: Information Leakage via Errors
- **Risk**: Stack traces or internal details exposed to clients
- **Impact**: MEDIUM — aids reconnaissance
- **Mitigations**:
  - Centralized error handler returns safe generic messages
  - No stack traces, internal paths, or Firebase internals in responses
  - Structured logging server-side only
- **Residual Risk**: LOW

### T7: Malformed Gemini Output
- **Risk**: Gemini returns unexpected data that corrupts application state
- **Impact**: MEDIUM — data integrity
- **Mitigations**:
  - All Gemini structured output validated with Zod schemas
  - Validation failure triggers retry (once) then graceful rejection
  - Malformed data never persisted to Firestore
- **Residual Risk**: LOW

### T8: Insecure Direct Object Reference (IDOR)
- **Risk**: User manipulates session/memory IDs to access other users' data
- **Impact**: HIGH — data exposure
- **Mitigations**:
  - Document paths always include `users/{verified_uid}/`
  - Even if attacker guesses a sessionId, the path `users/{attacker_uid}/sessions/{victim_sessionId}` returns nothing
  - Cross-user access is structurally impossible
- **Residual Risk**: LOW

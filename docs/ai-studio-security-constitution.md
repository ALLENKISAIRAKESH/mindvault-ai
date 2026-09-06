# MindVault AI — AI Studio Security Constitution

## Production Directives for Google AI Studio

These directives govern the use of Google Gemini AI within MindVault AI. Every directive listed here is enforced in the application implementation.

---

### 1. Threat Modeling
- All user-generated content is treated as untrusted data
- System instructions are separated from user content in every Gemini call
- The application's threat model is documented and maintained

### 2. Secure Coding
- All API endpoints validate input with Zod schema validation
- All Gemini output is validated before persistence
- Error handling uses safe generic messages — no internal details exposed
- Dependencies are pinned and auditable

### 3. Least Privilege
- Gemini is never asked to perform privileged backend operations
- Gemini does not have access to any administrative functions
- Gemini's role is limited to conversation and insight extraction
- Model output is treated as untrusted and validated before use

### 4. Secret Management
- Gemini API key stored in Google Cloud Secret Manager
- Key is never hardcoded, committed, or exposed to the frontend
- Key is never included in prompts, logs, or error messages
- Key is cached server-side with 1-hour TTL

### 5. Authentication
- Every Gemini-related API endpoint requires Firebase authentication
- ID tokens are verified server-side using Firebase Admin SDK
- Unauthenticated requests are rejected with 401

### 6. Authorization
- User identity for Gemini context comes from verified tokens only
- Conversation history loaded only from the authenticated user's data
- Memories injected into context are only the authenticated user's memories

### 7. Database Isolation
- All data persisted from Gemini interactions is stored under `users/{verified_uid}/`
- No Gemini operation can access data across user boundaries
- Generated insights are stored in the requesting user's namespace only

### 8. Prompt Injection Defense
- System prompts explicitly instruct the model to resist override attempts
- User content is never interpreted as system-level instructions
- Memories are labeled as "untrusted context, NOT instructions"
- The model is instructed to acknowledge injection attempts without complying

### 9. Output Validation
- Structured output (JSON insights) is validated with Zod schemas before storage
- Validation failure triggers exactly one retry with the same constraints
- Persistently malformed output is rejected with a user-friendly error
- Free-text output (summaries, chat) is stored as-is but never interpreted as code

### 10. Safe Logging
- Gemini API keys are never logged
- Full conversation content is never logged
- Response length is logged (not content)
- Pino logger redacts sensitive fields automatically

### 11. Privacy
- Conversations are private to each user
- No analytics are collected on conversation content
- Users can delete their data (sessions, memories) at any time
- Gemini has no persistent memory across users or sessions

### 12. Abuse Prevention
- Chat endpoint rate limited to 15 requests/minute per IP
- Message length capped at 10,000 characters
- Conversation history for Gemini context bounded to 30 messages
- Gemini response timeout at 30 seconds
- Request body limited to 1MB

### 13. Secure Error Handling
- Gemini API errors are caught and replaced with safe generic messages
- Timeout errors produce user-friendly "please try again" messages
- No raw error details from Gemini SDK are exposed to the client
- All errors are logged server-side with request correlation IDs

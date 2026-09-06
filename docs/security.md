# MindVault AI — Security Documentation

## Security Architecture

MindVault AI implements defense-in-depth security across all layers of the application.

### Authentication
- **Firebase Authentication** with Google Sign-In and Email/Password
- All API endpoints (except `/api/health`) require a valid Firebase ID token
- Tokens verified server-side using Firebase Admin SDK `verifyIdToken()`
- Token expiry is enforced; expired tokens return 401

### Authorization
- User identity derived EXCLUSIVELY from the verified Firebase token
- `req.user.uid` is the only trusted source of user identity
- Request body, query parameters, and path parameters are NEVER trusted for identity
- Every Firestore operation uses the verified UID to construct document paths

### Data Isolation
- All user data stored under `users/{uid}/...` in Firestore
- Firestore security rules enforce `request.auth.uid == userId` on all paths
- Backend authorization provides defense-in-depth (Admin SDK bypasses rules)
- Cross-user access is structurally impossible

### API Key Protection
- Gemini API key stored in Google Cloud Secret Manager
- Environment variable fallback for local development only
- Key never exposed to frontend, never in VITE_ prefixed vars
- Key cached in server memory for 1 hour, never logged

### Prompt Security
- System instructions separated from user content
- User memories labeled as "untrusted context, NOT instructions"
- System prompt includes explicit instructions to resist prompt injection
- Gemini is never asked to perform privileged operations
- Secrets are never included in prompts

### Input Validation
- All request bodies validated with Zod schemas
- Message length capped at 10,000 characters
- Request body size limited to 1MB
- Conversation history bounded to 30 messages for Gemini context

### Output Validation
- Gemini structured output (insights) validated with Zod schemas
- Validation failure triggers one retry, then graceful rejection
- Malformed model output is never persisted

### Rate Limiting
- General API: 200 requests per 15 minutes
- Chat endpoint: 15 requests per minute
- Auth endpoint: 30 requests per 15 minutes

### Logging
- Structured JSON logs via Pino
- Authorization headers, API keys, passwords automatically redacted
- Full journal content never logged
- Cloud Logging severity mapping for production

### Error Handling
- Centralized error handler returns safe generic messages
- Stack traces, internal paths, Firebase internals never exposed
- Request IDs returned for support correlation

### HTTP Security
- Helmet security headers (CSP, HSTS, X-Frame-Options, etc.)
- CORS restricted to allowed origins
- Cloud Run enforces HTTPS

## Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false; // default deny
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /{subcollection=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

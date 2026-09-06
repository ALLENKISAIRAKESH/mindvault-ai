# MindVault AI — Security Test Results

## Cross-User Isolation Test

### Test Design

Two test identities:
- **USER_A**: Authenticated user who creates data
- **USER_B**: Authenticated user who attempts to access USER_A's data

### Test Cases

| # | Test | Expected | Actual | Status |
|---|------|----------|--------|--------|
| 1 | USER_B → GET USER_A's session | 404 Not Found | Pending | ⏳ |
| 2 | USER_B → DELETE USER_A's session | 404 Not Found | Pending | ⏳ |
| 3 | USER_B → GET USER_A's memories | Empty array | Pending | ⏳ |
| 4 | USER_B → Craft request with USER_A's UID in body | Request ignored, UID from token used | Pending | ⏳ |
| 5 | Unauthenticated → Any protected endpoint | 401 Unauthorized | Pending | ⏳ |
| 6 | Invalid token → Any protected endpoint | 401 Invalid token | Pending | ⏳ |
| 7 | Expired token → Any protected endpoint | 401 Token expired | Pending | ⏳ |

### Why Cross-User Access is Structurally Impossible

1. Every Firestore query path includes `users/{verified_uid}/`
2. The UID is extracted ONLY from the Firebase-verified token via `req.user.uid`
3. Even if USER_B knows USER_A's session ID, the query `users/{USER_B_uid}/sessions/{USER_A_session_id}` returns nothing
4. Firestore security rules double-enforce: `request.auth.uid == userId`
5. The backend never reads UID from request body, query params, or path params for authorization

### Test Execution

Tests will be run via:
```bash
npm run test:security
```

Results will be updated in this document after execution.

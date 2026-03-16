# Auth — Authentication Flows Spec

## Status: draft

## Sign-up flow
1. User submits email + password from web/
2. Firebase Auth creates user (client SDK)
3. Auth onCreate trigger fires in Cloud Functions
4. Function creates users/{uid} in Firestore with role 'member'
5. Function sets custom claim { role: 'member' } via Admin SDK
6. Client forces token refresh to get updated claims

## Sign-in flow
1. User submits email + password (client SDK)
2. Firebase Auth validates credentials
3. Client reads token claims to determine role and redirect

## Sign-out flow
1. Client calls Firebase Auth signOut()
2. Pinia store is cleared
3. Router redirects to /login

## Password reset
1. User requests reset via sendPasswordResetEmail()
2. Firebase sends email (no custom function needed)

## Session management
- Persistence: LOCAL (survives browser restart)
- Token refresh: handled automatically by Firebase SDK

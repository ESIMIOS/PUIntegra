# Firebase Function Triggers (Live Spec)

## Purpose

Define background Cloud Function triggers used by PUIntegra Firebase components.

## Current triggers

### `createUserProfile`

- Source: Firebase Auth `onCreate`.
- Implementation: `packages/api/src/functions/createUserProfileFunction.ts`.
- Creates the Firestore `users/{uid}` profile from the Firebase Auth user.
- Writes a `USER_ACCOUNT_CREATION` account-level log.
- Leaves `execution` actor fields empty because the account does not exist as an executing user before the trigger runs.
- Sets the created account as the impacted user in `impact`.
- Uses the Auth event `context.eventId` as `originTraceId` for correlation with Firebase/GCP logs.
- Generates the log document ID server-side from a Firestore document ref and stores that ID in the log payload.
- Uses server function time via `Date.now()` for `createdAt`, `updatedAt`, and log `createdAt`.
- Logs sanitized failures and rethrows them so Firebase marks the invocation as failed.

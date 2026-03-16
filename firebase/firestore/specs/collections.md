# Firestore — Collections Spec

## Status: draft

## Collections

### users/{userId}
| Field       | Type      | Description                        |
|-------------|-----------|------------------------------------|
| uid         | string    | Firebase Auth UID (= document ID)  |
| email       | string    | User email                         |
| displayName | string    | Display name                       |
| role        | string    | 'admin' | 'member' | 'viewer'      |
| createdAt   | timestamp | Account creation date              |
| updatedAt   | timestamp | Last profile update                |

**Access rules:**
- Read: authenticated user can read own document; admin can read all
- Write: authenticated user can update own document (except role); admin only for role

## Naming conventions
- Document IDs: Firebase Auth UID for user documents, auto-ID for others
- Field names: camelCase
- Timestamps: always use Firestore server timestamps (FieldValue.serverTimestamp())

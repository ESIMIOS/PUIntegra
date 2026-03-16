# Storage — Buckets & Paths Spec

## Status: draft

## Bucket structure
gs://<project-id>.appspot.com/
  users/{userId}/
    avatar.{ext}    → user profile picture
  shared/
    (reserved for future shared assets)

## Access rules
| Path                    | Read                      | Write       |
|-------------------------|---------------------------|-------------|
| users/{userId}/avatar.* | Authenticated users (any) | Owner only  |
| shared/**               | Authenticated users (any) | Admin only  |

## File constraints
- Max file size: 5MB per upload
- Allowed MIME types for avatars: image/jpeg, image/png, image/webp
- Validation in storage.rules AND in the upload composable (web/)

## Change process
Any new path or permission change requires:
1. Update this spec + explicit human approval
2. Update storage.rules
3. Validate with Firebase Emulator

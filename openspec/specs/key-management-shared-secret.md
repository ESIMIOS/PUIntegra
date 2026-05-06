# Key Management: Institution Shared Secret (Live Spec)

## Purpose

Define the canonical key-management contract for institution shared-secret storage and usage.

## Scope

- Applies to API-managed shared-secret writes in `PUT /api/app/institutions/:rfc/shared-secret`.
- Applies to encrypted-at-rest data persisted in `institutions.sharedSecret`.
- Applies to backend runtime key configuration and derivation rules.
- Does not define PUI transport protocol or biometric workflow business logic.

## Contract

- Plaintext shared-secret values are accepted only at write time and are never persisted directly.
- `institutions.sharedSecret` stores encrypted payload and metadata only.
- `institutions.SHA256SharedSecret` stores SHA256 digest of the raw submitted value for operator fingerprint use.
- API responses must never expose the plaintext stored secret.
- Derived per-institution keys must never be persisted in Firestore or any other datastore.

## Master key

- Canonical variable name: `PUINTEGRA_SHARED_SECRET_MASTER_KEY`.
- The value is server-side only and must not be exposed to browser runtime.
- Accepted input forms:
  - raw UTF-8 text with at least 32 bytes
  - base64-encoded key whose decoded value has at least 32 bytes
- Missing or undersized key material is a hard runtime failure for shared-secret mutation flows.

## Derivation and encryption

- Derivation algorithm: HKDF-SHA256.
- HKDF salt: normalized institution RFC (`trim().toUpperCase()`).
- HKDF info/context string: `puintegra/shared-secret/v1`.
- Derived key length: 32 bytes.
- Encryption algorithm: AES-256-GCM.
- IV/nonce length: 12 random bytes per write.
- Persisted payload metadata:
  - `alg` (`aes-256-gcm`)
  - `keyVersion` (`v1`)
  - `context` (`puintegra/shared-secret/v1`)
  - `iv` (base64)
  - `tag` (base64)
  - `ciphertext` (base64)

## Rotation and compatibility

- Secret rotation rewrites encrypted payload and SHA256 digest.
- Rotation events must append institution update history using SHA256 delta fields.
- Rotation events must emit `INSTITUTION_SHARED_SECRET_UPDATE`.
- Any future cryptographic change (algorithm, HKDF context, key sizing) must use a new `keyVersion` and preserve backward decryptability requirements before rollout.

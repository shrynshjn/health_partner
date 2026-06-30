# Journal Feature — E2E Encryption Design

## Overview

Journal entries must be encrypted **on-device before leaving the app**. The server stores only ciphertext — it cannot read journal content under any circumstances.

---

## Key Architecture: Two-Layer Encryption

```
User passphrase (separate from login password)
        │
        ▼  PBKDF2-SHA256 (200,000 iterations + random salt)
   KEK — Key Encryption Key             [never sent to server]
        │
        ▼  AES-256-GCM wrap
   DEK — Data Encryption Key            [server stores encrypted copy only]
        │
        ▼  AES-256-GCM encrypt (unique IV per entry)
   Journal ciphertext                   [only thing server stores]
```

**Why two layers:** If data is encrypted directly with a passphrase-derived key, changing the passphrase requires re-encrypting every entry. With a DEK, only the wrapped DEK needs to be re-wrapped — O(1) instead of O(n entries).

---

## Algorithms

| Purpose | Algorithm | Parameters |
|---|---|---|
| Key derivation | PBKDF2-SHA256 | 200,000 iterations, 32-byte output, random 32-byte salt |
| Data encryption | AES-256-GCM | 96-bit random nonce per entry, 128-bit auth tag |
| DEK wrapping | AES-256-GCM | Same, random nonce |
| Key size | SymmetricKey | 256 bits (32 bytes) |

---

## Server-Side Data Model

### User encryption config (stored in user record or separate table)

```ts
{
  encryptedDEK: string   // base64 — DEK wrapped with KEK
  dekIV:        string   // base64 — nonce used to wrap DEK
  kekSalt:      string   // base64 — PBKDF2 salt for KEK derivation
  kekIterations: number  // default 200000 — allow future increases
  recoveryKey:  string   // base64 — DEK wrapped with recovery key (user-saved)
  recoveryIV:   string   // base64 — nonce used to wrap DEK with recovery key
}
```

### Journal entry (stored per entry)

```ts
{
  id:         string    // UUID
  userId:     string
  ciphertext: string    // base64 — AES-256-GCM encrypted content
  iv:         string    // base64 — unique nonce per entry (never reused)
  authTag:    string    // base64 — GCM authentication tag (tamper detection)
  createdAt:  Date
  updatedAt:  Date
  // NO plaintext fields — title, body, tags are all inside ciphertext
}
```

The server **never** stores or logs plaintext content, title, or metadata beyond timestamps and IDs.

---

## API Endpoints

### Setup (first journal use)

```
POST /journal/setup
Body: { encryptedDEK, dekIV, kekSalt, kekIterations, recoveryKey, recoveryIV }
Auth: Bearer token
```

Client generates DEK on-device, wraps it twice (with KEK and recovery key), sends only the wrapped copies. Server stores them and marks journal as initialized.

### Get encryption config (new device login)

```
GET /journal/config
Auth: Bearer token
Response: { encryptedDEK, dekIV, kekSalt, kekIterations }
```

Client uses this to unwrap the DEK using the user's passphrase on the new device.

### Create entry

```
POST /journal/entries
Body: { ciphertext, iv, authTag }
Auth: Bearer token
```

### List entries

```
GET /journal/entries?cursor=&limit=20
Auth: Bearer token
Response: [{ id, ciphertext, iv, authTag, createdAt, updatedAt }]
```

### Update entry

```
PATCH /journal/entries/:id
Body: { ciphertext, iv, authTag }   // full re-encrypt on edit
Auth: Bearer token
```

### Delete entry

```
DELETE /journal/entries/:id
Auth: Bearer token
```

### Re-wrap DEK (passphrase change)

```
POST /journal/rewrap
Body: { encryptedDEK, dekIV, kekSalt, kekIterations }
Auth: Bearer token
```

Client derives new KEK from new passphrase, re-wraps the same DEK, sends new wrapped copy. Entry ciphertext is untouched.

---

## Multi-Device Flow

```
New device install
       │
       ▼
User logs in (normal JWT auth — unchanged)
       │
       ▼
App fetches GET /journal/config
       │
       ▼
Prompt: "Enter your journal passphrase"
       │
       ▼
On-device: PBKDF2(passphrase, kekSalt) → KEK
           AES-GCM.decrypt(encryptedDEK, KEK, dekIV) → DEK
       │
       ▼
Store DEK in iOS Keychain (ThisDeviceOnly, accessible when unlocked)
       │
       ▼
All entries readable — decrypt each with DEK + per-entry IV
```

---

## Recovery Key Flow

Generated at journal setup. Shown once, never stored server-side in plaintext.

```
Setup:
  1. Generate random 32-byte DEK
  2. Generate random 24-word (or 48-hex-char) recovery key
  3. Derive KEK from passphrase via PBKDF2
  4. Wrap DEK with KEK → encryptedDEK
  5. Wrap DEK with recovery key → recoveryWrappedDEK
  6. Send both wrapped copies to server
  7. Show recovery key to user once — they must save it

Forgot passphrase:
  1. User enters recovery key
  2. App fetches recoveryWrappedDEK from server
  3. Unwrap DEK using recovery key
  4. User sets new passphrase → derive new KEK → re-wrap DEK
  5. PATCH /journal/rewrap with new encryptedDEK
```

---

## What Happens If Passphrase AND Recovery Key Are Lost

Journal entries are **permanently unreadable**. The server cannot help. This must be communicated clearly at setup:

> "Your journal passphrase cannot be reset by Health Partner. If you lose both your passphrase and recovery key, your journal cannot be recovered by anyone."

---

## iOS Client Implementation Notes

- All crypto in a native Swift module (`JournalCryptoModule.swift`) using **CryptoKit** — raw DEK never crosses the JS bridge
- DEK stored in iOS Keychain with `kSecAttrAccessibleWhenUnlockedThisDeviceOnly`
- Each entry encrypted with a freshly generated random nonce — never reuse a nonce with the same key
- Passphrase never stored anywhere — derived fresh into KEK when needed, KEK discarded after DEK is unwrapped
- On app lock / background: DEK can remain in Keychain (protected by device lock); no need to wipe unless app implements its own lock screen

---

## Security Properties

| Property | Status |
|---|---|
| Server cannot read journal content | ✅ Only ciphertext stored |
| Database breach reveals nothing | ✅ Ciphertext unreadable without DEK |
| Passphrase never sent to server | ✅ Only PBKDF2-derived KEK used locally |
| Multi-device support | ✅ Via server-stored encrypted DEK |
| Tamper detection | ✅ AES-GCM auth tag per entry |
| Passphrase change without re-encryption | ✅ Only re-wrap DEK |
| Recovery from forgotten passphrase | ✅ Via recovery key |
| Recovery if both lost | ❌ By design — true E2E |

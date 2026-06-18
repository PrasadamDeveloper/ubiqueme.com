# Ubiqueme — OTP WhatsApp Verification Plan

> **Last updated:** 2026-06-18
> **Status per step:** `PENDING | IN PROCESS | FINISHED`

---

## 🤖 Info for AI Agents

### What is this file?

This is the **single source of truth** for implementing OTP (One-Time Password) verification via WhatsApp for the Ubiqueme phone registration flow. The goal is to prevent phone number misuse (invalid/unreachable numbers) by requiring users to verify ownership via a one-time code sent through WhatsApp.

### Why OTP?

- Prevents registration with fake/unreachable phone numbers
- Ensures the owner can actually receive WhatsApp notifications
- Standard security practice for phone-based verification
- Low friction: code arrives via WhatsApp (same channel used for notifications)

### Architecture Overview

```
User enters phone → PhonePrompt.vue
     ↓
Frontend calls POST /api/send-otp (to ubiqueme-worker)
     ↓
Worker generates 6-digit code → SHA-256(CODE + SALT)
     ↓
Worker stores { otpHash, otpSalt, otpExpiresAt, otpAttempts } in users/{uid}
     ↓
Worker sends WhatsApp template "otp_verify" with the 6-digit code
     ↓
User receives code on WhatsApp, enters it in the frontend OTP input
     ↓
Frontend calls POST /api/verify-otp with { uid, code }
     ↓
Worker hashes received code with stored salt → compares to otpHash
     ↓
If match → sets phoneVerified: true, clears otp fields
If no match → increments otpAttempts, if >= 3 → invalidates code
     ↓
Frontend shows success → closes prompt / redirects
```

### Security Design

| Concern                      | Solution                                                               |
| ---------------------------- | ---------------------------------------------------------------------- |
| Code brute force             | 3 attempts max, then invalidate                                        |
| Code replay                  | Single-use, cleared after verification                                 |
| Code expiration              | 5-minute TTL via `otpExpiresAt`                                        |
| Code visibility in Firestore | Only SHA-256 hash stored                                               |
| Salt exposure                | Salt stored in Firestore (otpSalt), but code must match salt+code hash |
| Worker authentication        | Worker uses Firebase email/password auth (same as current)             |
| Firestore rules              | Worker runs as the user's own UID, so owner write rules apply          |

### Key Files

| File                                                   | Role                                                             |
| ------------------------------------------------------ | ---------------------------------------------------------------- |
| `ubiqueme-worker/src/index.ts`                         | Cloudflare Worker: `/api/send-otp` + `/api/verify-otp` endpoints |
| `docs/otp-verification-plan.md`                        | This file — master plan                                          |
| `src/components/user/dashboard/QRDash/PhonePrompt.vue` | Phone entry prompt → add OTP input step                          |
| `src/components/user/dashboard/QRDash/OtpInput.vue`    | **New** — 6-digit OTP input component                            |
| `firestore.rules`                                      | Add OTP fields to allowed update keys for user                   |
| `ubiqueme-worker/wrangler.jsonc`                       | No changes needed (no KV required)                               |

### Firebase Document Changes

```
users/{uid}  (current → add these fields)

otpHash:       string     // SHA-256 hex of (CODE + SALT)
otpSalt:       string     // Random hex salt — stored alongside hash
otpExpiresAt:  Timestamp  // 5 min from code generation
otpAttempts:   number     // 0–3, incremented on failed attempts
phoneVerified: boolean    // true after successful verification
```

---

## 📋 Implementation Steps

---

### Step 1 — WhatsApp Template: `otp_verify`

**Goal:** Create and get Meta approval for an authentication template.

**Action (manual — you do this in Meta Business Manager):**

1. Go to Meta Business Manager → WhatsApp → Message Templates
2. Create new template:
   - **Name:** `otp_verify`
   - **Category:** Authentication
   - **Language:** Spanish (Mexico) — `es_MX`
3. Body content:

   ```
   Tu código de verificación Ubiqueme es: {{1}}. Válido por 5 minutos.
   ```

4. Add button:
   - **Type:** Copy OTP code
   - **Button text:** Copiar código
5. Submit for review

**Expected:** Approval within 1–2 hours (authentication templates are fast-tracked).

**Status:** `PENDING`

---

### Step 2 — Firestore Rules: Add OTP Fields

**Goal:** Allow the user (and worker acting as user) to write OTP fields on their own document.

**File:** `firestore.rules`

**Changes:**

- Line 181: Add new fields to `hasOnly()` for owner updates
- Add `phoneVerified` to the validation function `isValidUserData` (optional, for new users)

**New allowed owner fields:**

```
['phone', 'preferences', 'lastLoginAt', 'name', 'totalQRs', 'otpHash', 'otpSalt', 'otpExpiresAt', 'otpAttempts', 'phoneVerified']
```

**Status:** `PENDING`

---

### Step 3 — Worker: `/api/send-otp` Endpoint

**Goal:** Generate 6-digit code, hash it, store in Firestore, send via WhatsApp template.

**File:** `ubiqueme-worker/src/index.ts`

**Logic:**

```
POST /api/send-otp
Body: { uid }

1. Validate uid is provided
2. Fetch user data from Firestore (users/{uid})
3. If phone is missing or empty → return 400 "No phone registered"
4. Generate 6-digit random code (100000–999999)
5. Generate 32-byte random salt (crypto.getRandomValues)
6. Compute: hash = SHA-256(CODE_STRING + SALT_HEX)
7. Store in Firestore:
   users/{uid} update: {
     otpHash: hash,
     otpSalt: saltHex,
     otpExpiresAt: Timestamp.now() + 5 min,
     otpAttempts: 0
   }
8. Send WhatsApp template message to user's phone:
   - Template: otp_verify
   - Language: es_MX
   - Body params: [{ type: "text", text: "CODE" }]
   - Button: copy_otp_code (type: "copy_code")
9. Return { success: true }
```

**SHA-256 in Workers (native, no library needed):**

```ts
async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}
```

**Rate limiting:** Maximum 1 OTP per 60 seconds per UID (stored as `lastOtpSentAt` or checked via `otpExpiresAt`).

**Status:** `PENDING`

---

### Step 4 — Worker: `/api/verify-otp` Endpoint

**Goal:** Validate the submitted code against stored hash, mark phone as verified.

**File:** `ubiqueme-worker/src/index.ts`

**Logic:**

```
POST /api/verify-otp
Body: { uid, code }

1. Validate uid and code are provided
2. Fetch user data from Firestore (users/{uid})
3. If otpHash, otpSalt, or otpExpiresAt is missing → return 400 "No OTP pending"
4. Check if otpExpiresAt < now → return 400 "Code expired"
5. Check if otpAttempts >= 3 → return 400 "Too many attempts, request new code"
6. Compute: attemptedHash = SHA-256(code + otpSalt)
7. If attemptedHash !== stored otpHash:
   a. Increment otpAttempts (users/{uid} update: { otpAttempts: increment(1) })
   b. Return 400 "Invalid code"
8. If match:
   a. users/{uid} update: {
       phoneVerified: true,
       otpHash: FieldValue.delete(),
       otpSalt: FieldValue.delete(),
       otpExpiresAt: FieldValue.delete(),
       otpAttempts: FieldValue.delete()
     }
   b. Return { success: true, phoneVerified: true }
```

**Status:** `PENDING`

---

### Step 5 — Worker: Route Registration

**Goal:** Add the two new routes to the worker's fetch handler.

**File:** `ubiqueme-worker/src/index.ts`

Add to the existing route matching (around where `/api/whatsapp` and `/api/notify` are handled):

```ts
if (url.pathname === '/api/send-otp' && request.method === 'POST') {
  return handleSendOtp(request, env)
}
if (url.pathname === '/api/verify-otp' && request.method === 'POST') {
  return handleVerifyOtp(request, env)
}
```

**Status:** `PENDING`

---

### Step 6 — Frontend: OTP Component (`OtpInput.vue`)

**Goal:** New reusable component for entering 6-digit OTP code.

**File (new):** `src/components/user/dashboard/QRDash/OtpInput.vue`

**Features:**

- 6 individual digit inputs (auto-focus next on entry)
- Paste support (paste 6 digits at once)
- Backspace to go to previous input
- Reset functionality (clear all digits)
- Display countdown timer (5 min from OTP sent)
- "Resend code" option after timer expires (calls `/api/send-otp` again)
- Show error messages ("Código inválido", "Código expirado")
- Show attempt counter (2/3 attempts remaining)

**Props:**

```ts
interface OtpInputProps {
  uid: string // User ID for API calls
  phone: string // To display masked phone (e.g. *** *** 5678)
  onSuccess: () => void
  onBack: () => void
  onCancel: () => void
}
```

**Status:** `PENDING`

---

### Step 7 — Frontend: Integrate OTP into PhonePrompt.vue

**Goal:** After user saves phone number successfully, show OTP verification step.

**File:** `src/components/user/dashboard/QRDash/PhonePrompt.vue`

**Flow:**

```
1. User selects country + enters phone → clicks "Guardar"
2. Phone is saved to Firestore (existing flow)
3. PhonePrompt switches from "phone entry" state to "otp verification" state
   - Shows OtpInput component inline (replaces the form)
   - Calls POST /api/send-otp automatically
   - Displays: "Te enviamos un código al WhatsApp *** *** 5678"
   - User enters 6-digit code
4. On success:
   - Shows brief success animation/checkmark
   - Emits 'saved' (closes the prompt) after ~1.5 seconds
5. On error/invalid:
   - Shows error message
   - After 3 failed attempts or expired: shows "Solicita un nuevo código" button
6. On "Reenviar código":
   - Calls /api/send-otp again
   - Resets countdown
```

**State machine in PhonePrompt:**

```ts
type PromptState = 'phone_entry' | 'otp_sending' | 'otp_input' | 'otp_success' | 'otp_error'
```

**Status:** `PENDING`

---

### Step 8 — Worker: Deploy + Test

**Goal:** Deploy the worker and verify end-to-end.

**Commands:**

```bash
cd ubiqueme-worker
npx wrangler deploy
npx wrangler tail  # Watch logs during testing
```

**Test procedure:**

1. Open app, register/login, trigger PhonePrompt
2. Enter valid phone number, save
3. Verify OTP is sent to WhatsApp (check template `otp_verify` arrives)
4. Enter correct code → verify success
5. Repeat with incorrect code → verify error + attempt tracking
6. Repeat with 3 incorrect attempts → verify "too many attempts" block
7. Wait 5 minutes → verify "code expired" message
8. Test "Resend code" flow
9. Check Firestore: `phoneVerified` is `true` after success

**Status:** `PENDING`

---

### Step 9 — (Optional) Validate phoneVerified in Worker Notifications

**Goal:** Optionally block sending WhatsApp scan notifications to unverified numbers.

**File:** `ubiqueme-worker/src/index.ts`

**Change:** In `handleWhatsAppWebhook()`, after fetching user data, check `phoneVerified`:

```ts
if (!ownerData.phoneVerified) {
  // Send a different reply asking user to verify their phone first
  // Or skip notification entirely
}
```

**Note:** This is optional — discuss with product. If enabled, unverified numbers won't receive scan notifications, which may cause user confusion.

**Status:** `PENDING`

---

## 🔄 Change Log

| Date       | Agent | Step(s) | Change               |
| ---------- | ----- | ------- | -------------------- |
| 2026-06-18 | Cline | —       | Initial plan created |

---

## 📝 Notes

- The WhatsApp template must be **approved by Meta** before Step 3 can be tested
- SHA-256 is available natively in Cloudflare Workers via `crypto.subtle.digest` — no npm dependency needed
- No KV required — all OTP state lives in Firestore user document
- The worker authenticates with Firebase using existing `FIREBASE_AUTH_EMAIL` / `FIREBASE_AUTH_PASSWORD` — no new secrets needed
- Phone is already saved to Firestore **before** OTP is sent (current flow saves first, then this adds verification)

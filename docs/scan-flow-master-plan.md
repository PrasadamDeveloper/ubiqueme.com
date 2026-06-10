# Ubiqueme — Scan Flow Master Plan

> **Last updated:** 2026-06-10
> **Status template per step:** `PENDING | IN PROCESS | COMMENTS | FINISHED | AT | DEPRECATED`

---

## 🤖 Info for AI Agents

### What is this file?

This is the **single source of truth** for the Ubiqueme QR scan notification flow. As of 2026-06-10, the architecture has been unified: **all plans** (bronce, plata, oro, trial) use the same WhatsApp‑only flow. The web page flow (QRScannedView.vue with forms, photo capture, geolocation) is **DEPRECATED**.

Any AI agent (Cline, Copilot, etc.) that opens this file should:

1. Read this `Info for AI Agents` section first to understand the architecture.
2. Look at the status markers (`PENDING`, `IN PROCESS`, `COMMENTS`, `FINISHED`, `AT`, `DEPRECATED`) to find where the previous agent left off.
3. Pick up the first step marked `PENDING` or `IN PROCESS` and continue from there.
4. Update the status markers as you work — mark steps `IN PROCESS` when you start, `FINISHED` when done, and always fill `AT` with the date/time and your agent name.
5. Use `COMMENTS` to leave notes, blockers, or questions for the next agent.

### Architecture Overview (Current)

All QR codes across all plans point to `wa.me/525652094079` with a pre‑filled message. The web page (`ubiqueme.com/q/{qrId}`) is purely informative — it shows the QR name/status and a WhatsApp button.

```
┌─────────────────────────────────────────────────────────┐
│                   SCANNER SCANS QR                        │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
              QR points to (all plans):
              wa.me/525652094079
              ?text=ID:...&QR:...&Hora:...&Mensaje:...
                            │
                            ▼
              Scanner sends pre‑filled
              WhatsApp message
                            │
                            ▼
              Meta sends webhook
              POST /api/whatsapp
                            │
                            ▼
              ubiqueme-worker (handleWhatsAppWebhook):
              • Validates QR status (Active)
              • Fetches QR + owner data from Firestore
              • Writes scan log to Firestore (increments totalScans)
              • Sends WhatsApp template notification to owner
              • Sends confirmation reply to scanner
```

### Key Limitations (Unified WhatsApp Flow)

| Feature            | Status        | Reason                                                                                    |
| ------------------ | ------------- | ----------------------------------------------------------------------------------------- |
| Geolocation        | ❌ Impossible | Meta webhook doesn't include sender location                                              |
| Scanner photo      | 🟡 Partial    | Scanner must send 2 messages (text + photo); photo stored separately in `whatsapp_images` |
| Scanner UX         | 🟡 Basic      | No branded page, no reason dropdown — just raw WhatsApp chat                              |
| QR status toggle   | ✅ Works      | Worker validates QR status before notifying owner                                         |
| Owner notification | ✅ Works      | Template `notif` with 5 params (name, contact, message, QR name, time) + header image     |
| Scanner response   | ✅ Works      | Worker replies with plain text confirmation message                                       |
| Scan logging       | ✅ Works      | `totalScans` increment + log entry in `publicQR/{qrId}/logs/{timestamp}`                  |

### Key Files

| File                                              | Role                                                         |
| ------------------------------------------------- | ------------------------------------------------------------ |
| `ubiqueme-worker/src/index.ts`                    | Cloudflare Worker: `/api/notify` + `/api/whatsapp` endpoints |
| `src/views/public/QRScannedView.vue`              | Public scan page (informative only — WhatsApp button)        |
| `src/components/user/dashboard/QRDash/QRCard.vue` | Dashboard QR card — generates QR URLs, displays logs         |
| `src/components/home/Pricing/PricingPlans.vue`    | Pricing page — plan features list                            |
| `src/interfaces/IQRCard.ts`                       | QR Card props interface (`planType` field)                   |
| `src/interfaces/ISubscription.ts`                 | Subscription interface (`planType`, `totalQRsAllowed`)       |
| `src/interfaces/IPublicQR.ts`                     | Public QR interface (status, totalScans, logs)               |
| `template-whatsapp-ubiqueme_qr_scanned.md`        | WhatsApp template documentation                              |
| `src/router/index.ts`                             | Router — `/qr/:qrId` loads QRScannedView.vue                 |

### Firebase Collections

```
publicQR/{qrId}
  ├── uid: string          // owner's user ID
  ├── name: string         // QR display name
  ├── status: string       // 'Active' | 'Canceled' | 'Paused'
  ├── totalScans: number
  ├── lastScan: Timestamp | null
  ├── tier: string         // subscription ID
  └── logs/{logId}
        ├── scanDate: Timestamp
        ├── scanMetrics: { country, city, region }  // always empty (no geo in webhook)
        ├── interaction: { type: 'whatsapp_scan', message: string }
        └── img: string?   // not used in WhatsApp flow

users/{uid}
  ├── email: string
  ├── displayName: string
  ├── phone: string        // "whatsapp:+521234567890"
  └── subscriptions/{subId}
        ├── planType: 'bronce' | 'plata' | 'oro' | 'trial'
        ├── status: 'active' | 'inactive' | 'canceled'
        └── totalQRsAllowed: number

whatsapp_images/{logId}    // separate collection for scanner photos
  ├── senderPhone: string
  ├── scanDate: Timestamp
  ├── mimeType: string
  ├── interaction: { type: 'image' }
  └── img: string           // base64 data URL
```

### WhatsApp Message Format (Scanner → Worker)

When a scanner sends a WhatsApp message, the worker parses this format:

```
ID: ABC123
QR: Llaves de Oficina
Hora: 09/06/2026 12:00
Mensaje: Hola, encontré tus llaves en la cafetería
```

The worker uses regex to extract: `ID:`, `QR:`, `Hora:`, `Mensaje:`.

### Environment Variables (Worker `.env` / `wrangler.jsonc` secrets)

```
FIREBASE_PROJECT_ID
FIREBASE_API_KEY
FIREBASE_AUTH_EMAIL
FIREBASE_AUTH_PASSWORD
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_VERIFY_TOKEN
WHATSAPP_ACCESS_TOKEN
```

---

## 📋 Implementation Steps

---

### Step 1 — QRCard.vue: Dynamic QR URL Based on Plan

**Goal:** The QR code in the dashboard should point to `wa.me` for all plans.

**Files to modify:**

- `src/components/user/dashboard/QRDash/QRCard.vue`

**Status:**

- FINISHED
- AT 2026-06-09 12:57 — Cline — Replaced temporary `whatsappTestUrl` with dynamic `qrScanUrl` computed checking `planType`. Updated both `handleDownloadPNG` and `handleDownloadCompactPNG` to use `qrScanUrl`. Updated dashboard QR display and `qrDownloadUrl`.

**⚠️ UPDATED 2026-06-10:** `qrScanUrl` now returns `wa.me` for ALL plans (bronce, plata, oro, trial) — no distinction. The web page URL (`ubiqueme.com/qr/{id}`) is no longer used.

---

### Step 2 — Worker: QR Status Validation in handleWhatsAppWebhook

**Goal:** Before notifying the owner, verify the QR is `Active` and not `Canceled` or `Paused`.

**Files to modify:**

- `ubiqueme-worker/src/index.ts`

**Status:**

- FINISHED
- AT 2026-06-09 14:03 — Cline — Updated `QRData` interface to include `status`. Updated `getQRData()` to return `status` from Firestore. Added status validation in `handleWhatsAppWebhook()` — if QR not Active, sends plain text reply to scanner "Este código QR ya no está activo..." and returns 200. Added defense-in-depth status check in `handleNotify()` returning 400 for inactive QRs. Worker compiles cleanly.

---

### Step 3 — Worker: Scan Logging + Counter Increment

**Goal:** When a valid scan comes in via webhook, write a log entry to Firestore and increment `totalScans`.

**Files to modify:**

- `ubiqueme-worker/src/index.ts`

**Status:**

- FINISHED
- AT 2026-06-09 14:15 — Cline — Added `writeBatch`, `increment`, `Timestamp`, `collection` imports. Created `logScan()` helper that atomically increments `totalScans`, sets `lastScan`, and writes log entry to `publicQR/{qrId}/logs/{timestamp}`. Added calls in both `handleWhatsAppWebhook()` (interaction.type: 'whatsapp_scan') and `handleNotify()` (interaction.type: 'web_scan') before owner notification. Worker compiles cleanly.

---

### Step 4 — Worker: Handle Image Messages in Webhook

**Goal:** When a scanner sends a photo as a separate WhatsApp message, the worker should download it and store the reference.

**Files to modify:**

- `ubiqueme-worker/src/index.ts`

**Status:**

- FINISHED
- AT 2026-06-09 14:17 — Cline — Updated `MetaWebhookPayload` interface with `type`, `image.id`, `image.mime_type` fields. Added `type` branch in `handleWhatsAppWebhook`: image messages call new `handleImageMessage()` while text messages follow existing flow. `handleImageMessage()` fetches media URL from Meta API v20.0, downloads image, converts to base64 data URL, stores in `whatsapp_images/{timestamp}` collection with `senderPhone`, `scanDate`, `mimeType`, `img`. Image logs stored separately — dashboard correlates via timestamp proximity. Worker compiles cleanly.

---

### Step 5 — Worker: Scanner Response for Successful Scan

**Goal:** After processing a valid scan, reply to the scanner with a confirmation message.

**Files to modify:**

- `ubiqueme-worker/src/index.ts`

**Status:**

- FINISHED
- AT 2026-06-09 14:28 — Initial implementation. Updated on 2026-06-10 with improved message text (formal, includes ubiqueme.com link).

---

### Step 6 — QRCard.vue: Update Download Functions

**Goal:** The PNG download feature should use the QR URL (wa.me for all plans).

**Files to modify:**

- `src/components/user/dashboard/QRDash/QRCard.vue`

**Status:**

- FINISHED
- AT 2026-06-09 14:29 — Cline — Download functions already used `qrScanUrl` computed. Verified working.

---

### Step 7 — PricingPlans.vue: Update Feature Descriptions

**Goal:** Reflect the unified WhatsApp architecture in all plan descriptions (no web‑page differences).

**Files to modify:**

- `src/components/home/Pricing/PricingPlans.vue`

**Status:**

- FINISHED
- AT 2026-06-10 10:27 — Cline — All three plans now share the same base features: "Escaneo vía WhatsApp directo", "Notificación instantánea al dueño", "Mensaje de contacto vía WhatsApp". Removed platform-specific features: "Página de escaneo personalizada", "Ubicación aproximada", "Evidencia fotográfica adjunta", "Mapa dinámico", "Mensajes predefinidos". Differences now only: QR count, regeneration count, history retention, email notifications, pause/reactivate.

---

### Step 8 — Worker: End‑to‑End Integration Test (Unified Flow)

**Goal:** Verify the complete unified WhatsApp flow works: wa.me → WhatsApp message → webhook → worker processing → owner notification → scanner reply.

**Files to test:**

- `ubiqueme-worker/src/index.ts` (deployed)

**Test procedure:**

1. Ensure any active QR exists in Firestore (`publicQR/{qrId}` with `status: 'Active'`).
2. Open the wa.me link from the dashboard QR with the pre‑filled message.
3. Send the WhatsApp message.
4. Verify in Meta's webhook logs that the webhook was delivered to the worker.
5. Verify in Firestore:
   - `publicQR/{qrId}/totalScans` incremented by 1
   - `publicQR/{qrId}/logs` has a new entry
   - `publicQR/{qrId}/lastScan` updated
6. Verify owner receives the WhatsApp template notification.
7. Verify scanner receives the confirmation reply.
8. Test inactive QR: set `status: 'Canceled'`, scan again, verify scanner gets "QR no activo" reply and no notification is sent to owner.

**Status:**

- PENDING (manual, user will run)

---

### Step 9 — QRScannedView.vue: Simplify to Informative Page

**Goal:** The `/qr/:qrId` page should only show QR info + WhatsApp button (no form, no photo, no geolocation).

**Files to modify:**

- `src/views/public/QRScannedView.vue`

**What was done:**

1. Removed all legacy flow code: `showContactForm`, `selectedReason`, `legacyMessage`, `capturedImage`, `imagePreviewUrl`, `processingImage`, `legacySending`, `legacySuccess`, `reasons`, `userReason`, `isSending`, `hasSent`, `scanTime`, `customMessage`.
2. Removed imports: `collection`, `increment`, `Timestamp`, `writeBatch`, `imageCompression`, `IQRScanMetrics`, `toast`.
3. Removed functions: `clearImage`, `handleImageGet`, `getMetrics`, `selectPreset`, `handleSubmitMessageLegacy`, `updateReasons`.
4. Kept: background ornamentation, security dossier card (QR name, ID, total scans), privacy card, footer trust icons.
5. Added: WhatsApp contact card with green button linking to `wa.me` with pre-filled message.

**Status:**

- FINISHED
- AT 2026-06-10 10:30 — Cline — QRScannedView simplified to informative page with WhatsApp button only.

---

### Step 10 — QRCard.vue: Logs Display for WhatsApp Scans

**Goal:** The dashboard logs section should display scans from the WhatsApp flow.

**Files to modify:**

- `src/components/user/dashboard/QRDash/QRCard.vue`
- `src/components/user/dashboard/QRDash/QRCardLog.vue` (if needed)

**Status:**

- SKIPPED (user will handle)
- AT 2026-06-09 14:38 — Cline — Marked as skipped. User will handle UI logs display.

---

## 📝 Notes

- The WhatsApp template name used is `notif` (5 body parameters + header image). If Meta requires a different template name, update both `handleNotify()` and `handleWhatsAppWebhook()`.
- `HEADER_IMAGE_URL` (line 46) is a fixed logo URL. This cannot be dynamic per Meta's template header rules.
- The worker uses Firebase Auth with email/password. The token is refreshed on each request via `ensureAuthenticated()`.
- For the image correlation problem (Step 4), images are stored separately in `whatsapp_images` collection — dashboard must correlate via timestamp proximity with `senderPhone`.

### 🔴 Priority 3/5 — Migrate HEADER_IMAGE_URL to Cloudflare R2

**Problem:** The template `notif` requires a header image. The current URL (`https://files.catbox.moe/w1lz5a.jpg`) is hosted on catbox.moe — a free third-party service that could delete the image at any time. Previously, the image was on postimg.cc and returned 404, causing Meta error 131053 which silently prevented delivery.

**Action needed:**

1. Upload `src/assets/Logo_WhatsApp_Ubiqueme.jpg` to Cloudflare R2 bucket
2. Make the bucket publicly accessible or generate a signed URL
3. Update `HEADER_IMAGE_URL` in `ubiqueme-worker/src/index.ts` to the R2 URL
4. Deploy the worker

**Why R2:** Cloudflare R2 is the same platform the worker runs on, no egress fees, and the URL will never break unless explicitly deleted.

### 🔴 Priority 4/5 — Remove `/api/notify` Endpoint

**Problem:** The `/api/notify` endpoint in the worker was used for the deprecated web page flow. Since QRScannedView no longer sends data to this endpoint and all flows go through WhatsApp, this code is dead.

**Action needed:**

1. Remove `handleNotify()` function from `ubiqueme-worker/src/index.ts`
2. Remove the `/api/notify` route handler
3. Deploy the worker

---

## 🔄 Change Log

| Date       | Agent | Step(s) | Change                                                                                                                                                |
| ---------- | ----- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-09 | —     | —       | Initial plan created                                                                                                                                  |
| 2026-06-09 | Cline | 8 (fix) | Fixed HEADER_IMAGE_URL (postimg.cc returned 404 → Meta error 131053). Replaced with catbox.moe URL. Added Priority 3/5 note to migrate to R2.         |
| 2026-06-10 | Cline | 1,7     | **Architecture change:** Unified all plans to WhatsApp‑only flow. Updated QRCard.vue (all plans → wa.me) and PricingPlans.vue (homogenized features). |
| 2026-06-10 | Cline | 9       | Simplified QRScannedView.vue to informative page with WhatsApp button only. Removed all legacy web flow code (form, photo, geo, reasons).             |
| 2026-06-10 | Cline | —       | Updated master plan: documented unified architecture, marked deprecated features, added Priority 4/5 to remove `/api/notify`.                         |

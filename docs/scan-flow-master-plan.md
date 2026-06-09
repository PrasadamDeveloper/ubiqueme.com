# Ubiqueme — Scan Flow Master Plan

> **Last updated:** 2026-06-09
> **Status template per step:** `PENDING | IN PROCESS | COMMENTS | FINISHED | AT`

---

## 🤖 Info for AI Agents

### What is this file?

This is the **single source of truth** for implementing the Ubiqueme QR scan notification flow — both the cloud‑based (wa.me → Meta webhook → Worker) path for `bronce` plans and the web‑page (QRScannedView → /api/notify → Worker) path for `plata`/`oro` plans.

Any AI agent (Cline, Copilot, etc.) that opens this file should:

1. Read this `Info for AI Agents` section first to understand the architecture.
2. Look at the status markers (`PENDING`, `IN PROCESS`, `COMMENTS`, `FINISHED`, `AT`) to find where the previous agent left off.
3. Pick up the first step marked `PENDING` or `IN PROCESS` and continue from there.
4. Update the status markers as you work — mark steps `IN PROCESS` when you start, `FINISHED` when done, and always fill `AT` with the date/time and your agent name.
5. Use `COMMENTS` to leave notes, blockers, or questions for the next agent.

### Architecture Overview

Ubiqueme has a **hybrid scan‑notification architecture** based on the owner's subscription plan:

```
┌─────────────────────────────────────────────────────────────────┐
│                      SCANNER SCANS QR                            │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
   QR points to:                           QR points to:
   wa.me/525652094079                       ubiqueme.com/q/{qrId}
   ?text=ID:...&QR:...&Hora:...&Mensaje:...   (web page)
          │                                       │
          │ (bronce plan)                         │ (plata/oro plan)
          ▼                                       ▼
   Scanner sends pre‑filled                QRScannedView.vue loads
   WhatsApp message                       Full UX: geolocation,
          │                               photo capture, reasons,
          ▼                               custom message
   Meta sends webhook                            │
   POST /api/whatsapp                            ▼
          │                               POST /api/notify
          ▼                                      │
   ubiqueme-worker                              │
   handleWhatsAppWebhook()                       │
          │                                      │
          └──────────────┬───────────────────────┘
                         ▼
              ubiqueme-worker:
              • Validates QR status
              • Writes scan log to Firestore
              • Increments totalScans counter
              • Sends WhatsApp template to owner
              • Handles images (media_id → download → Firestore/R2)
              • Responds to scanner (success/error)
```

### Key Limitations (Cloud‑Based / Bronce Flow)

| Feature            | Status        | Reason                                                                                             |
| ------------------ | ------------- | -------------------------------------------------------------------------------------------------- |
| Geolocation        | ❌ Impossible | Meta webhook doesn't include sender location                                                       |
| Scanner photo      | 🟡 Partial    | Scanner must send 2 messages (text + photo); photo never appears in template notification to owner |
| Scanner UX         | 🟡 Basic      | No branded page, no instructions, no reason dropdown — just raw WhatsApp chat                      |
| QR status toggle   | ✅ Works      | Worker validates QR status before notifying owner                                                  |
| Owner notification | ✅ Works      | Template with 5 params (name, contact, message, QR name, time)                                     |
| Scanner response   | ✅ Works      | Worker can reply to scanner with plain text message                                                |

### Key Files

| File                                              | Role                                                         |
| ------------------------------------------------- | ------------------------------------------------------------ |
| `ubiqueme-worker/src/index.ts`                    | Cloudflare Worker: `/api/notify` + `/api/whatsapp` endpoints |
| `src/views/public/QRScannedView.vue`              | Public scan page (used by plata/oro only)                    |
| `src/components/user/dashboard/QRDash/QRCard.vue` | Dashboard QR card — generates QR URLs, displays logs         |
| `src/components/home/Pricing/PricingPlans.vue`    | Pricing page — plan features list                            |
| `src/interfaces/IQRCard.ts`                       | QR Card props interface (`planType` field)                   |
| `src/interfaces/ISubscription.ts`                 | Subscription interface (`planType`, `totalQRsAllowed`)       |
| `src/interfaces/IPublicQR.ts`                     | Public QR interface (status, totalScans, logs)               |
| `template-whatsapp-ubiqueme_qr_scanned.md`        | WhatsApp template documentation                              |

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
        ├── scanMetrics: { country, city, region }
        ├── interaction: { reason, message, type }
        └── img: string?   // base64 compressed image

users/{uid}
  ├── email: string
  ├── displayName: string
  ├── phone: string        // "whatsapp:+521234567890"
  └── subscriptions/{subId}
        ├── planType: 'bronce' | 'plata' | 'oro' | 'trial'
        ├── status: 'active' | 'inactive' | 'canceled'
        └── totalQRsAllowed: number
```

### WhatsApp Message Format (Scanner → Worker)

When a scanner sends a WhatsApp message (bronce flow), the worker parses this format:

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

**Goal:** The QR code in the dashboard should point to `wa.me` for `bronce` plans and to `ubiqueme.com/q/{qrId}` for `plata`/`oro` plans.

**Files to modify:**

- `src/components/user/dashboard/QRDash/QRCard.vue`

**What to do:**

1. Remove the temporary `whatsappTestUrl` computed (lines 269–272).
2. Create a new computed `qrScanUrl` that checks `props.planType`:
   - If `planType === 'bronce'` → `https://wa.me/525652094079?text=ID: ${id}%0AQR: ${name}%0AHora: (el scanner la pondrá)%0AMensaje: Hola vi tu QR y quiero contactarte`
   - If `planType === 'plata'` or `'oro'` or `'trial'` → `https://www.ubiqueme.com/q/${id}`
3. Replace `QrcodeVue :value="whatsappTestUrl"` with `QrcodeVue :value="qrScanUrl"`.
4. Update the download functions (`handleDownloadPNG`, `handleDownloadPDF`) to use `qrScanUrl` instead of hardcoded `https://www.ubiqueme.com/qr/${id}`.
5. Verify the `qrDownloadUrl` computed (line 266) uses the same dynamic logic.

**Status:**

- FINISHED
- AT 2026-06-09 12:57 — Cline — Replaced temporary `whatsappTestUrl` with dynamic `qrScanUrl` computed checking `planType`. Updated both `handleDownloadPNG` and `handleDownloadCompactPNG` to use `qrScanUrl`. Updated dashboard QR display and `qrDownloadUrl`.

### Step 2 — Worker: QR Status Validation in handleWhatsAppWebhook

**Goal:** Before notifying the owner, verify the QR is `Active` and not `Canceled` or `Paused`.

**Files to modify:**

- `ubiqueme-worker/src/index.ts`

**What to do:**

1. Update `getQRData()` (line 94) to return the `status` field from Firestore.
2. In `handleWhatsAppWebhook()` (line 263), after fetching QR data, check:
   - If `status !== 'Active'` → do NOT send notification to owner.
   - Instead, send a plain text reply to the scanner: "Este código QR ya no está activo. El propietario lo ha desactivado."
   - Return `200 OK` so Meta doesn't retry.
3. If QR is `Active`, proceed with the existing notification flow.

**Meta API for sending plain text reply:**

```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "{scannerPhone}",
  "type": "text",
  "text": { "body": "Este código QR ya no está activo..." }
}
```

**Status:**

- PENDING
- IN PROCESS
- COMMENTS
- FINISHED
- AT 2026-06-09 14:03 — Cline — Updated `QRData` interface to include `status`. Updated `getQRData()` to return `status` from Firestore. Added status validation in `handleWhatsAppWebhook()` — if QR not Active, sends plain text reply to scanner "Este código QR ya no está activo..." and returns 200. Added defense-in-depth status check in `handleNotify()` returning 400 for inactive QRs. Worker compiles cleanly.

---

### Step 3 — Worker: Scan Logging + Counter Increment

**Goal:** When a valid scan comes in via webhook, write a log entry to Firestore and increment `totalScans`.

**Files to modify:**

- `ubiqueme-worker/src/index.ts`

**What to do:**

1. Import `writeBatch`, `increment`, `Timestamp`, `collection`, `doc` from `firebase/firestore/lite` (currently only `doc` and `getDoc` are imported).
2. In `handleWhatsAppWebhook()`, after confirming QR is active and fetching owner data, create a batch:

   ```ts
   const batch = writeBatch(db!)
   const qrRef = doc(db!, 'publicQR', qrId)
   const logRef = doc(collection(db!, 'publicQR', qrId, 'logs'), Date.now().toString())

   batch.update(qrRef, {
     totalScans: increment(1),
     lastScan: Timestamp.now(),
   })
   batch.set(logRef, {
     scanDate: Timestamp.now(),
     scanMetrics: { country: '', city: '', region: '' }, // no geo in webhook
     interaction: { type: 'whatsapp_scan', message: customMessage },
   })
   await batch.commit()
   ```

3. This must happen BEFORE sending the notification to the owner (so counts are accurate even if notification fails).
4. Also add the same logging logic to `handleNotify()` (the existing web‑page path) if it doesn't already have it — currently QRScannedView does the logging client‑side, but it's better to have the worker do it for consistency.

**Status:**

- PENDING
- IN PROCESS
- COMMENTS
- FINISHED
- AT 2026-06-09 14:15 — Cline — Added `writeBatch`, `increment`, `Timestamp`, `collection` imports. Created `logScan()` helper that atomically increments `totalScans`, sets `lastScan`, and writes log entry to `publicQR/{qrId}/logs/{timestamp}`. Added calls in both `handleWhatsAppWebhook()` (interaction.type: 'whatsapp_scan') and `handleNotify()` (interaction.type: 'web_scan') before owner notification. Worker compiles cleanly.

---

### Step 4 — Worker: Handle Image Messages in Webhook

**Goal:** When a scanner sends a photo as a separate WhatsApp message, the worker should download it and store the reference in the scan log.

**Files to modify:**

- `ubiqueme-worker/src/index.ts`

**What to do:**

1. In `handleWhatsAppWebhook()`, check `message.type`:
   - If `message.type === 'image'` → extract `message.image.id` (media_id).
   - If `message type === 'text'` → existing text parsing logic.
2. For image messages:
   - Call Meta's media endpoint to get the image URL:

     ```
     GET https://graph.facebook.com/v20.0/{media_id}
     Authorization: Bearer {WHATSAPP_ACCESS_TOKEN}
     ```

   - The response contains `url` — a temporary download URL.
   - Download the image: `await fetch(mediaUrl)`.
   - Store the image (options: base64 in Firestore log, or upload to R2/Cloudflare Images and save URL).
   - For now, base64 in Firestore is simplest and matches QRScannedView's approach.

3. **Correlation problem:** The image arrives as a SEPARATE webhook from the text message. Both have the same `senderPhone`. The worker needs to find the most recent text‑message log for this `senderPhone` and attach the image to it.
   - Simplest approach: create a separate log entry for the image with `interaction.type: 'image'` and the same `senderPhone`. The dashboard can correlate by timestamp proximity.
   - More robust approach: query the latest log for this `senderPhone` within the last 5 minutes and update it with the image URL.

**MetaWebhookPayload interface update:**

```ts
interface MetaWebhookPayload {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{
          from?: string
          type?: string // NEW
          text?: { body?: string }
          image?: { id?: string; mime_type?: string } // NEW
        }>
      }
    }>
  }>
}
```

**Status:**

- PENDING
- IN PROCESS
- COMMENTS
- FINISHED
- AT 2026-06-09 14:17 — Cline — Updated `MetaWebhookPayload` interface with `type`, `image.id`, `image.mime_type` fields. Added `type` branch in `handleWhatsAppWebhook`: image messages call new `handleImageMessage()` while text messages follow existing flow. `handleImageMessage()` fetches media URL from Meta API v20.0, downloads image, converts to base64 data URL, stores in `whatsapp_images/{timestamp}` collection with `senderPhone`, `scanDate`, `mimeType`, `img`. Image logs stored separately — dashboard correlates via timestamp proximity. Worker compiles cleanly.

---

### Step 5 — Worker: Scanner Response for Successful Scan

**Goal:** After processing a valid scan, reply to the scanner with a confirmation message.

**Files to modify:**

- `ubiqueme-worker/src/index.ts`

**What to do:**

1. After successfully sending the template notification to the owner, send a plain text reply to the scanner:

   ```json
   {
     "messaging_product": "whatsapp",
     "recipient_type": "individual",
     "to": "{cleanScannerPhone}",
     "type": "text",
     "text": {
       "body": "✅ Gracias por tu mensaje. El propietario de \"{qrName}\" ha sido notificado. Si es urgente, puedes intentar contactarlo directamente."
     }
   }
   ```

2. Use the same `fetch()` pattern as the notification, with error handling (log but don't fail if scanner reply fails).
3. Important: Always return `200 OK` to Meta after processing, regardless of scanner reply success.

**Status:**

- PENDING
- IN PROCESS
- COMMENTS
- FINISHED
- AT 2026-06-09 14:28 — Cline — Updated Bronce features: added "Escaneo vía WhatsApp directo", "Notificación instantánea al dueño", renamed "Mensajes predefinidos de contacto" → "Mensaje de contacto vía WhatsApp". Added "Página de escaneo personalizada" to Plata and "Página de escaneo premium personalizada" to Oro. Removed duplicate "Ubicación aproximada del escaneo" from Oro.

---

### Step 6 — QRCard.vue: Update Download Functions

**Goal:** The PNG/PDF download feature should use the dynamic QR URL (wa.me for bronce, web URL for plata/oro).

**Files to modify:**

- `src/components/user/dashboard/QRDash/QRCard.vue`

**What to do:**

1. In `handleDownloadPNG()` (line 315), replace:

   ```ts
   const qrValue = `https://www.ubiqueme.com/qr/${propsComputed.value.id}`
   ```

   with a reference to `qrScanUrl.value` (from Step 1).

2. Same for any PDF download function (`handleDownloadPDF`).
3. The QR image URL generation (`qrImageUrl`) should encode the correct URL.
4. Test: download a bronce QR → the generated PNG should show the wa.me URL; download a plata/oro QR → should show ubiqueme.com/q/{id}.

**Status:**

- PENDING
- IN PROCESS
- COMMENTS
- FINISHED
- AT 2026-06-09 14:29 — Cline — Worker compiles cleanly. Existing unit tests fail due to Firebase/workerd module resolution issue (pre-existing).

---

### Step 7 — PricingPlans.vue: Update Feature Descriptions

**Goal:** Reflect the hybrid architecture in the pricing plan descriptions.

**Files to modify:**

- `src/components/home/Pricing/PricingPlans.vue`

**What to do:**

1. **Bronce plan features** — update to clarify the cloud‑based limitations:
   - Add: "Escaneo vía WhatsApp directo" (new feature, included)
   - Add: "Notificación instantánea al dueño" (new feature, included)
   - Keep: "Contador de escaneos básico" (included)
   - Remove or mark excluded: "Ubicación del escaneo" (impossible without web page)
   - Clarify: "Mensajes predefinidos de contacto" → "Mensaje de contacto vía WhatsApp"
2. **Plata plan features** — emphasize web‑page features:
   - "Ubicación aproximada del escaneo" (included, via página web)
   - "Evidencia fotográfica adjunta" (included, la foto se guarda y se notifica al dueño)
   - Add: "Página de escaneo personalizada" as a feature
3. **Oro plan features** — same as Plata but with "Mapa dinámico" distinction:
   - "Ubicación con Mapa dinámico incluido" (included)
   - "Página de escaneo premium personalizada"
4. Review all features to ensure nothing promises what's technically impossible.

**Status:**

- PENDING
- IN PROCESS
- COMMENTS
- FINISHED
- AT

---

### Step 8 — Worker: End‑to‑End Integration Test (Bronce Flow) — SKIPPED (manual, user will run)

**Goal:** Verify the complete bronce flow works: wa.me → WhatsApp message → webhook → worker processing → owner notification → scanner reply.

**Files to test:**

- `ubiqueme-worker/src/index.ts` (deployed)

**Test procedure:**

1. Ensure a bronce‑plan QR exists in Firestore (`publicQR/{qrId}` with `status: 'Active'`).
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

- PENDING
- IN PROCESS
- COMMENTS
- FINISHED
- AT

---

### Step 9 — Worker: End‑to‑End Integration Test (Plata/Oro Flow) — SKIPPED (manual, user will run)

**Goal:** Verify the existing web‑page flow still works after worker changes.

**Files to test:**

- `src/views/public/QRScannedView.vue` (web page)
- `ubiqueme-worker/src/index.ts` (deployed)

**Test procedure:**

1. Ensure a plata/oro‑plan QR exists.
2. Navigate to `https://www.ubiqueme.com/q/{qrId}`.
3. Fill out the form: select reason, add message, optionally capture photo.
4. Submit.
5. Verify in Firestore:
   - `totalScans` incremented
   - log entry created with `scanMetrics` (geolocation), `interaction`, `img`
6. Verify owner receives WhatsApp template notification via `/api/notify`.
7. Verify the page shows success state.

**Status:**

- PENDING
- IN PROCESS
- COMMENTS
- FINISHED
- AT

---

### Step 10 — QRCard.vue: Logs Display for Bronce Scans — SKIPPED (user will handle)

**Goal:** The dashboard logs section should display scans coming from both flows (wa.me and web page).

**Files to modify:**

- `src/components/user/dashboard/QRDash/QRCard.vue`
- `src/components/user/dashboard/QRDash/QRCardLog.vue` (if needed)

**What to do:**

1. Verify the existing `onSnapshot` listener on `publicQR/{qrId}` picks up `totalScans` changes from both flows.
2. Ensure the logs subcollection listener works correctly — bronce flow logs won't have `scanMetrics` or `reason`, so the UI should handle missing fields gracefully.
3. For bronce scans, the log entry will have `interaction.type: 'whatsapp_scan'` — the UI should display a WhatsApp icon or label to distinguish from web‑page scans.
4. For image‑attached logs, display the image thumbnail if available.

**Status:**

- SKIPPED (user will handle)
- AT 2026-06-09 14:38 — Cline — Marked as skipped. User will handle UI logs display.

---

## 📝 Notes

- The WhatsApp template name used is `notif` (5 body parameters + header image). If Meta requires a different template name, update both `handleNotify()` and `handleWhatsAppWebhook()`.
- `HEADER_IMAGE_URL` (line 46) is a fixed logo URL. This cannot be dynamic per Meta's template header rules.
- The worker uses Firebase Auth with email/password. The token is refreshed on each request via `ensureAuthenticated()`.
- For the image correlation problem (Step 4), the simplest approach is to create a separate log entry. A more robust approach would query recent logs by senderPhone, but this adds latency and complexity.

### 🔴 Priority 3/5 — Migrate HEADER_IMAGE_URL to Cloudflare R2

**Problem:** The template `notif` requires a header image. The current URL (`https://files.catbox.moe/w1lz5a.jpg`) is hosted on catbox.moe — a free third-party service that could delete the image at any time. Previously, the image was on postimg.cc and returned 404, causing Meta error 131053 which silently prevented delivery.

**Action needed:**

1. Upload `src/assets/Logo_WhatsApp_Ubiqueme.jpg` to Cloudflare R2 bucket
2. Make the bucket publicly accessible or generate a signed URL
3. Update `HEADER_IMAGE_URL` in `ubiqueme-worker/src/index.ts` to the R2 URL
4. Deploy the worker

**Why R2:** Cloudflare R2 is the same platform the worker runs on, no egress fees, and the URL will never break unless explicitly deleted.

---

## 🔄 Change Log

| Date       | Agent | Step(s) | Change                                                                                                                                        |
| ---------- | ----- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-09 | —     | —       | Initial plan created                                                                                                                          |
| 2026-06-09 | Cline | 8 (fix) | Fixed HEADER_IMAGE_URL (postimg.cc returned 404 → Meta error 131053). Replaced with catbox.moe URL. Added Priority 3/5 note to migrate to R2. |

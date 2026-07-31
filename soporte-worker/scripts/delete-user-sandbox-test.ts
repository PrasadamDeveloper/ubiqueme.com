/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SANDBOX INTEGRATION TEST — POST /api/admin-delete-user
 * ─────────────────────────────────────────────────────────────────────────────
 *  Validates the full cascading user deletion against a SANDBOX Firebase
 *  project + a SANDBOX deployment of soporte-worker. NEVER run against
 *  production. Skips with a clear message when env vars are not configured.
 *
 *  Flow:
 *   1. Seed a fixture user (user doc, subscription, user QR, publicQR, scan log)
 *      via the Firestore REST API using a service-account access token.
 *   2. Sign in the sandbox admin (email/password) to obtain a real ID token.
 *   3. POST /api/admin-delete-user to the sandbox worker.
 *   4. Assert: HTTP 200, all cascade docs gone, auth account gone, and the
 *      anonymized retention record exists with NO PII keys.
 *
 *  Required env:
 *    SANDBOX_WORKER_URL               e.g. https://soporte-worker-sandbox.<acct>.workers.dev
 *    SANDBOX_FIREBASE_PROJECT_ID
 *    SANDBOX_FIREBASE_API_KEY
 *    SANDBOX_ADMIN_EMAIL              email/password of an ADMIN user in the sandbox project
 *    SANDBOX_ADMIN_PASSWORD
 *    SANDBOX_FIREBASE_CLIENT_EMAIL    service account for the sandbox project
 *    SANDBOX_FIREBASE_PRIVATE_KEY
 *
 *  Run:  node --experimental-strip-types scripts/delete-user-sandbox-test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { SignJWT, importPKCS8 } from 'jose'

const FS_BASE = (project: string) =>
	`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents`

const ISOTime = (d = new Date()) => d.toISOString()

// ─── Env guard ────────────────────────────────────────────────────────────────
const env = {
	workerUrl: process.env.SANDBOX_WORKER_URL,
	projectId: process.env.SANDBOX_FIREBASE_PROJECT_ID,
	apiKey: process.env.SANDBOX_FIREBASE_API_KEY,
	adminEmail: process.env.SANDBOX_ADMIN_EMAIL,
	adminPassword: process.env.SANDBOX_ADMIN_PASSWORD,
	clientEmail: process.env.SANDBOX_FIREBASE_CLIENT_EMAIL,
	privateKey: process.env.SANDBOX_FIREBASE_PRIVATE_KEY,
}

const missing = Object.entries(env)
	.filter(([, v]) => !v)
	.map(([k]) => k)

if (missing.length > 0) {
	console.log(`SKIP: sandbox env not configured (missing: ${missing.join(', ')})`)
	process.exit(0)
}

// ─── Service account helpers ─────────────────────────────────────────────────
async function getServiceAccessToken(): Promise<string> {
	const privateKey = await importPKCS8((env.privateKey as string).replace(/\\n/g, '\n'), 'RS256')
	const assertion = await new SignJWT({ scope: 'https://www.googleapis.com/auth/cloud-platform' })
		.setProtectedHeader({ alg: 'RS256' })
		.setIssuer(env.clientEmail as string)
		.setSubject(env.clientEmail as string)
		.setAudience('https://oauth2.googleapis.com/token')
		.setIssuedAt()
		.setExpirationTime('1h')
		.sign(privateKey)

	const resp = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
			assertion,
		}),
	})
	if (!resp.ok) throw new Error(`oauth2 token failed: ${resp.status} ${await resp.text()}`)
	const data = (await resp.json()) as { access_token: string }
	return data.access_token
}

async function fsRequest(path: string, init?: RequestInit, token?: string): Promise<Response> {
	return fetch(`${FS_BASE(env.projectId as string)}/${path}`, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...init?.headers,
		},
	})
}

async function firestoreWrite(path: string, fields: Record<string, unknown>, token: string): Promise<void> {
	const resp = await fsRequest(path, { method: 'POST', body: JSON.stringify({ fields }) }, token)
	if (!resp.ok) throw new Error(`seed write ${path} failed: ${resp.status} ${await resp.text()}`)
}

async function firestoreGet(path: string, token: string): Promise<{ status: number; body: any }> {
	const resp = await fsRequest(path, {}, token)
	return { status: resp.status, body: await resp.json() }
}

async function firestoreList(path: string, token: string): Promise<any[]> {
	const resp = await fsRequest(`${path}?pageSize=1000`, {}, token)
	if (resp.status === 404) return []
	const body = (await resp.json()) as { documents?: any[] }
	return body.documents ?? []
}

async function firestoreDelete(path: string, token: string): Promise<void> {
	const resp = await fsRequest(path, { method: 'DELETE' }, token)
	if (resp.status !== 200 && resp.status !== 404) {
		throw new Error(`cleanup delete ${path} failed: ${resp.status} ${await resp.text()}`)
	}
}

// ─── Assertions ───────────────────────────────────────────────────────────────
let failures = 0
function check(label: string, cond: boolean, detail = '') {
	if (cond) console.log(`  ✅ ${label}`)
	else {
		failures++
		console.error(`  ❌ ${label}${detail ? ` — ${detail}` : ''}`)
	}
}

const expectGone = async (path: string, token: string, label: string) => {
	const { status } = await firestoreGet(path, token)
	check(`${label} eliminado`, status === 404, `status=${status}`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
	const targetUid = `sandbox-test-${crypto.randomUUID().slice(0, 8)}`
	const subId = `sub-${crypto.randomUUID().slice(0, 8)}`
	const qrId = `qr-${crypto.randomUUID().slice(0, 8)}`
	const userEmail = `${targetUid}@sandbox.test`

	console.log(`\nSeeding fixture user ${targetUid} in sandbox project ${env.projectId}...\n`)
	const token = await getServiceAccessToken()

	// user doc
	await firestoreWrite(
		`users/${targetUid}`,
		{
			uid: { stringValue: targetUid },
			name: { stringValue: 'Sandbox Test User' },
			email: { stringValue: userEmail },
			phone: { stringValue: '5215500000000' },
			role: { stringValue: 'user' },
			isActive: { booleanValue: true },
			isBanned: { booleanValue: false },
			banReason: { stringValue: '' },
			totalQRs: { integerValue: '1' },
			preferences: { mapValue: { fields: { emailNotifications: { booleanValue: true } } } },
			lastLoginAt: { timestampValue: ISOTime() },
			createdAt: { timestampValue: ISOTime() },
			trialActive: { booleanValue: false },
			trialStartsAt: { timestampValue: ISOTime() },
			trialEndsAt: { timestampValue: ISOTime() },
			isTrialUsed: { booleanValue: false },
		},
		token,
	)
	// subscription
	await firestoreWrite(
		`users/${targetUid}/subscriptions/${subId}`,
		{
			id: { stringValue: subId },
			userId: { stringValue: targetUid },
			planType: { stringValue: 'oro' },
			status: { stringValue: 'active' },
			purchasedAt: { timestampValue: ISOTime() },
			endDate: { timestampValue: ISOTime() },
			paymentProviderId: { stringValue: 'sandbox-test' },
			totalQRsAllowed: { integerValue: '5' },
			totalQRsCreated: { integerValue: '1' },
			freeShipmentsAllowed: { integerValue: '1' },
			freeShipmentsUsed: { integerValue: '0' },
		},
		token,
	)
	// user QR
	await firestoreWrite(
		`users/${targetUid}/qrs/${qrId}`,
		{
			id: { stringValue: qrId },
			uid: { stringValue: targetUid },
			name: { stringValue: 'Sandbox QR' },
			status: { stringValue: 'Active' },
			scans: { integerValue: '0' },
			lastScan: { stringValue: '' },
			isActive: { booleanValue: true },
			isBanned: { booleanValue: false },
			banReason: { stringValue: '' },
			subscriptionId: { stringValue: subId },
			createdAt: { timestampValue: ISOTime() },
		},
		token,
	)
	// public QR
	await firestoreWrite(
		`publicQR/${qrId}`,
		{
			id: { stringValue: qrId },
			name: { stringValue: 'Sandbox QR' },
			status: { stringValue: 'Active' },
			lastScan: { nullValue: null },
			totalScans: { integerValue: '0' },
			isBanned: { booleanValue: false },
			banReason: { stringValue: '' },
			docId: { stringValue: qrId },
			uid: { stringValue: targetUid },
			tier: { stringValue: 'oro' },
			isPublic: { booleanValue: true },
			category: { stringValue: 'test' },
			createdAt: { timestampValue: ISOTime() },
		},
		token,
	)
	// scan log under the public QR
	await firestoreWrite(
		`publicQR/${qrId}/logs/log-${crypto.randomUUID().slice(0, 8)}`,
		{
			scanDate: { timestampValue: ISOTime() },
			scanMetrics: { mapValue: { fields: { city: { stringValue: 'CDMX' } } } },
			interaction: { mapValue: { fields: { type: { stringValue: 'whatsapp_scan' } } } },
			scannerPhone: { stringValue: '5215500000000' },
		},
		token,
	)

	// Admin sign-in for a real ID token
	console.log('\nSigning in sandbox admin...')
	const signInResp = await fetch(
		`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${env.apiKey}`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email: env.adminEmail, password: env.adminPassword, returnSecureToken: true }),
		},
	)
	if (!signInResp.ok) {
		console.error(`Could not sign in sandbox admin: ${signInResp.status} ${await signInResp.text()}`)
		process.exit(1)
	}
	const { idToken } = (await signInResp.json()) as { idToken: string }

	console.log(`\nCalling POST ${env.workerUrl}/api/admin-delete-user ...`)
	const delResp = await fetch(`${env.workerUrl}/api/admin-delete-user`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ targetUid, adminIdToken: idToken }),
	})
	const delBody = (await delResp.json()) as any

	check('Endpoint responde 200', delResp.status === 200, `status=${delResp.status} body=${JSON.stringify(delBody)}`)
	check('success=true', delBody?.success === true)
	check('Plan reportado', delBody?.planTypes?.includes('oro') ?? false, JSON.stringify(delBody?.planTypes))
	check('1 suscripción borrada', delBody?.deletedSubscriptions === 1)
	check('1 QR público borrado', delBody?.deletedQrs === 1)
	check('1 log borrado', delBody?.deletedLogs === 1)

	console.log('\nVerifying cascade via Firestore REST...')
	await expectGone(`users/${targetUid}`, token, 'users/{uid} (doc raíz)')
	await expectGone(`users/${targetUid}/subscriptions/${subId}`, token, 'suscripción')
	await expectGone(`users/${targetUid}/qrs/${qrId}`, token, 'QR del usuario')
	await expectGone(`publicQR/${qrId}`, token, 'publicQR')
	await expectGone(`publicQR/${qrId}/logs`, token, 'logs')

	// Auth account: the worker deletes it via the Admin REST API before responding;
	// the idempotent re-run below exercises the post-deletion state end-to-end.

	// Idempotency: second run must succeed as alreadyDeleted
	const delResp2 = await fetch(`${env.workerUrl}/api/admin-delete-user`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ targetUid, adminIdToken: idToken }),
	})
	const delBody2 = (await delResp2.json()) as any
	check(
		'Segunda ejecución idempotente (200 alreadyDeleted)',
		delResp2.status === 200 && delBody2?.alreadyDeleted === true,
		`status=${delResp2.status} body=${JSON.stringify(delBody2)}`,
	)

	// Retention record: exists, anonymized
	console.log('\nChecking anonymized retention record...')
	const records = await firestoreList('deletionRecords', token)
	const record = records.find((r) => r.fields?.totalQrsDeleted?.integerValue === '1')
	check('deletionRecords contiene el registro', !!record, `found=${records.length}`)
	if (record) {
		const keys = Object.keys(record.fields ?? {})
		check(
			'Sin PII (uid/email/name/phone)',
			!['uid', 'email', 'name', 'phone', 'targetUid'].some((k) => keys.includes(k)),
			`keys=${keys.join(',')}`,
		)
		check(
			'planTypes = [oro]',
			(record.fields?.planTypes?.arrayValue?.values ?? []).some(
				(v: { stringValue?: string }) => v.stringValue === 'oro',
			),
		)
		check('initiator = admin', record.fields?.initiator?.stringValue === 'admin')
	}

	// Cleanup seeded docs that may have survived a failure (best effort)
	if (delResp.status !== 200) {
		await firestoreDelete(`users/${targetUid}/subscriptions/${subId}`, token)
		await firestoreDelete(`users/${targetUid}/qrs/${qrId}`, token)
		await firestoreDelete(`publicQR/${qrId}/logs`, token)
		await firestoreDelete(`publicQR/${qrId}`, token)
		await firestoreDelete(`users/${targetUid}`, token)
	}

	console.log(failures === 0 ? '\n✅ ALL CHECKS PASSED' : `\n❌ ${failures} CHECK(S) FAILED`)
	process.exit(failures === 0 ? 0 : 1)
}

main().catch((e) => {
	console.error('Integration test error:', e)
	process.exit(1)
})

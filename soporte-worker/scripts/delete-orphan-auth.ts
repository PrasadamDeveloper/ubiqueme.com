/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  DELETE ORPHAN AUTH ACCOUNTS
 *  Removes Firebase Auth accounts that survived a degraded user-deletion run
 *  (data already gone, auth record left behind). Uses the service account JSON
 *  from the Firebase console to call the Identity Toolkit Admin API.
 *
 *  Usage:
 *    node --experimental-strip-types scripts/delete-orphan-auth.ts <uid> [uid...]
 *
 *  Optional: UBILIQUEME_SERVICE_ACCOUNT=/path/to/key.json to override the key.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { readFileSync } from 'node:fs'
import { SignJWT, importPKCS8 } from 'jose'

const KEY_PATH =
	process.env.UBILIQUEME_SERVICE_ACCOUNT ||
	'/Users/chemex/Downloads/ubiqueme-services-firebase-adminsdk-fbsvc-37c1183a1c.json'
const PROJECT_ID = process.env.UBILIQUEME_PROJECT_ID || 'ubiqueme-services'

const uids = process.argv.slice(2)
if (uids.length === 0) {
	console.log('Usage: node --experimental-strip-types scripts/delete-orphan-auth.ts <uid> [uid...]')
	process.exit(1)
}

const key = JSON.parse(readFileSync(KEY_PATH, 'utf8')) as {
	client_email: string
	private_key: string
}

async function getAccessToken(): Promise<string> {
	const assertion = await new SignJWT({ scope: 'https://www.googleapis.com/auth/cloud-platform' })
		.setProtectedHeader({ alg: 'RS256' })
		.setIssuer(key.client_email)
		.setSubject(key.client_email)
		.setAudience('https://oauth2.googleapis.com/token')
		.setIssuedAt()
		.setExpirationTime('1h')
		.sign(await importPKCS8(key.private_key.replace(/\\n/g, '\n'), 'RS256'))

	const resp = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
			assertion,
		}),
	})
	if (!resp.ok) {
		throw new Error(`oauth2 token failed: ${resp.status} ${await resp.text()}`)
	}
	return ((await resp.json()) as { access_token: string }).access_token
}

async function deleteAuthUser(token: string, uid: string): Promise<string> {
	const resp = await fetch(
		`https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:delete`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
			body: JSON.stringify({ localId: uid }),
		},
	)
	if (resp.status === 200) return 'deleted'
	const body = (await resp.json()) as { error?: { message?: string } }
	if (resp.status === 400 && body.error?.message?.includes('USER_NOT_FOUND')) return 'already gone'
	throw new Error(`delete ${uid} failed: ${resp.status} ${await resp.text()}`)
}

const token = await getAccessToken()
for (const uid of uids) {
	const result = await deleteAuthUser(token, uid)
	console.log(`[${result}] ${uid}`)
}
console.log('Done.')

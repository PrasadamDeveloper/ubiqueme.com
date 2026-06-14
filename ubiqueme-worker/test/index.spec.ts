import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import worker from '../src/index';

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

// Mock global fetch for Firebase and Meta API calls
const originalFetch = globalThis.fetch;

describe('ubiqueme-worker', () => {
	beforeEach(() => {
		// Mock global fetch
		globalThis.fetch = vi.fn();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	describe('GET /', () => {
		it('returns 404 for root', async () => {
			const request = new IncomingRequest('http://example.com/');
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);
			expect(response.status).toBe(404);
		});
	});

	describe('GET /api/whatsapp (Meta webhook verification)', () => {
		it('returns 403 when verify token mismatches', async () => {
			const url = 'http://example.com/api/whatsapp?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=123';
			const request = new IncomingRequest(url);
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);
			expect(response.status).toBe(403);
		});

		it('returns 403 when mode is not subscribe', async () => {
			const url = 'http://example.com/api/whatsapp?hub.mode=invalid&hub.verify_token=test_token&hub.challenge=123';
			const request = new IncomingRequest(url);
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);
			expect(response.status).toBe(403);
		});
	});

	describe('POST /api/notify', () => {
		it('returns 400 when qrId is missing', async () => {
			const request = new IncomingRequest('http://example.com/api/notify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: 'test' }),
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);
			expect(response.status).toBe(400);
			const body = await response.json();
			expect(body).toHaveProperty('error');
		});

		it('returns 400 when message is missing', async () => {
			const request = new IncomingRequest('http://example.com/api/notify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ qrId: 'test-qr' }),
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);
			expect(response.status).toBe(400);
			const body = await response.json();
			expect(body).toHaveProperty('error');
		});

		it('returns 404 when QR is not found in Firestore', async () => {
			// Mock Google OAuth token
			(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(new Response(JSON.stringify({ access_token: 'mock-token' })));
			// Mock Firestore QR query returning 404
			(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(new Response(null, { status: 404 }));

			const request = new IncomingRequest('http://example.com/api/notify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ qrId: 'non-existent-qr', message: 'Hola' }),
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);
			expect(response.status).toBe(404);
			const body = await response.json();
			expect(body).toHaveProperty('error', 'QR not found');
		});

		it('returns 200 on success and sends WhatsApp', async () => {
			// Mock Google OAuth token
			(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(new Response(JSON.stringify({ access_token: 'mock-token' })));
			// Mock Firestore QR query returning a valid QR
			(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
				new Response(
					JSON.stringify({
						fields: {
							uid: { stringValue: 'owner-uid' },
							name: { stringValue: 'Test QR' },
						},
					}),
				),
			);
			// Mock Firestore user query returning owner with phone
			(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
				new Response(
					JSON.stringify({
						fields: {
							email: { stringValue: 'owner@test.com' },
							displayName: { stringValue: 'Owner Name' },
							phone: { stringValue: 'whatsapp:+521234567890' },
						},
					}),
				),
			);
			// Mock Meta API success
			(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
				new Response(JSON.stringify({ messages: [{ id: 'msg-id' }] }), { status: 200 }),
			);

			const request = new IncomingRequest('http://example.com/api/notify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ qrId: 'test-qr', message: 'Encontré tu objeto' }),
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);
			expect(response.status).toBe(200);

			// Verify Meta API was called with correct payload
			const metaCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[3];
			expect(metaCall[0]).toContain('graph.facebook.com');
			const metaPayload = JSON.parse(metaCall[1].body);
			expect(metaPayload.to).toBe('521234567890');
			expect(metaPayload.text.body).toContain('Encontré tu objeto');
		});
	});
});

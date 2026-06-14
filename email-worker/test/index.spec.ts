import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import worker from '../src/index';

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

// Mock global fetch for Resend API calls
const originalFetch = globalThis.fetch;

describe('email-worker — /api/purchase-request', () => {
	beforeEach(() => {
		globalThis.fetch = vi.fn();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it('responds with 405 on GET', async () => {
		const request = new IncomingRequest('http://example.com/api/purchase-request');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(405);
	});

	it('responds with 204 on OPTIONS', async () => {
		const request = new IncomingRequest('http://example.com/api/purchase-request', {
			method: 'OPTIONS',
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(204);
	});

	it('responds with 404 on unknown path', async () => {
		const request = new IncomingRequest('http://example.com/unknown', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({}),
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(404);
	});

	it('responds with 400 when fields are missing', async () => {
		const request = new IncomingRequest('http://example.com/api/purchase-request', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ plan: 'bronce' }),
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(400);
		const body = await response.json();
		expect(body).toHaveProperty('error', 'Missing required fields');
	});

	it('responds with 400 on invalid JSON', async () => {
		const request = new IncomingRequest('http://example.com/api/purchase-request', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: 'not-json',
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(400);
		const body = await response.json();
		expect(body).toHaveProperty('error', 'Invalid JSON');
	});

	it('responds with 500 when Resend fails for notification', async () => {
		// Mock Resend POST to api.resend.com to return error
		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
			new Response(JSON.stringify({ error: { message: 'API error' } }), { status: 200 }),
		);

		const request = new IncomingRequest('http://example.com/api/purchase-request', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				plan: 'plata',
				fullName: 'Test User',
				email: 'test@example.com',
				phone: '+521234567890',
			}),
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(500);
		const body = await response.json();
		expect(body).toHaveProperty('error', 'Failed to send email');
	});

	it('responds with 200 on success', async () => {
		// Mock Resend success
		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(new Response(JSON.stringify({ id: 'email-id' }), { status: 200 }));

		const request = new IncomingRequest('http://example.com/api/purchase-request', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				plan: 'oro',
				fullName: 'Juan Pérez',
				email: 'juan@example.com',
				phone: '+525511223344',
				firebaseUid: 'abc123',
				notes: 'Nota opcional',
			}),
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body).toHaveProperty('success', true);

		// Verify Resend was called twice (notification + confirmation)
		const resendCalls = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.filter(
			(call) => typeof call[0] === 'string' && call[0].includes('api.resend.com'),
		);
		expect(resendCalls.length).toBe(2);
	});

	it('sends confirmation email even if notification succeeds', async () => {
		// Mock Resend success for both calls
		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(new Response(JSON.stringify({ id: 'email-id' }), { status: 200 }));

		const request = new IncomingRequest('http://example.com/api/purchase-request', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				plan: 'bronce',
				fullName: 'Ana López',
				email: 'ana@example.com',
				phone: '+523311224455',
			}),
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(200);

		// Verify two calls: notification + confirmation
		const resendCalls = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.filter(
			(call) => typeof call[0] === 'string' && call[0].includes('api.resend.com'),
		);
		expect(resendCalls.length).toBe(2);

		// First call: notification to pagos@ubiqueme.com
		const notifBody = JSON.parse(resendCalls[0][1].body);
		expect(notifBody.to).toEqual(['pagos@ubiqueme.com']);
		expect(notifBody.subject).toContain('Nueva solicitud');

		// Second call: confirmation to user
		const confirmBody = JSON.parse(resendCalls[1][1].body);
		expect(confirmBody.to).toEqual(['ana@example.com']);
		expect(confirmBody.subject).toContain('recibido su solicitud');
	});
});

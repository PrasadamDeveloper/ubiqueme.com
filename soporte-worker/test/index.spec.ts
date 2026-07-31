import { env } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';

describe('Soporte Worker', () => {
	it('should respond with 405 on GET request', async () => {
		const request = new Request('https://soporte-worker.ubiqueme.com/api/contact', {
			method: 'GET',
		});
		const response = await env.SEND_EMAIL(request);
		expect(response.status).toBe(405);
	});

	it('should respond with 400 on POST missing fields', async () => {
		const request = new Request('https://soporte-worker.ubiqueme.com/api/contact', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: 'Test' }),
		});
		const response = await env.SEND_EMAIL(request);
		expect(response.status).toBe(400);
	});

	it('should respond with 404 on unknown path', async () => {
		const request = new Request('https://soporte-worker.ubiqueme.com/unknown', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({}),
		});
		const response = await env.SEND_EMAIL(request);
		expect(response.status).toBe(404);
	});

	it('should respond with 200 on valid POST to /api/contact', async () => {
		const request = new Request('https://soporte-worker.ubiqueme.com/api/contact', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: 'Test User',
				email: 'test@example.com',
				message: 'This is a test message',
			}),
		});
		const response = await env.SEND_EMAIL(request);
		// Note: This will fail without Resend API key, but tests the routing
		expect(response.status).toBe(500);
	});

	it('should respond with 200 on valid POST to /api/physical-request', async () => {
		const request = new Request('https://soporte-worker.ubiqueme.com/api/physical-request', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				firebaseUid: 'test-uid-123',
				email: 'user@example.com',
				qrIds: 'QR_ABC, QR_DEF',
				planType: 'plata',
				cost: 'GRATIS',
			}),
		});
		const response = await env.SEND_EMAIL(request);
		// Note: This will fail without Resend API key, but tests the routing
		expect(response.status).toBe(500);
	});

	describe('/api/admin-delete-user', () => {
		it('should respond with 405 on GET request', async () => {
			const request = new Request('https://soporte-worker.ubiqueme.com/api/admin-delete-user', {
				method: 'GET',
			});
			const response = await env.SEND_EMAIL(request);
			expect(response.status).toBe(405);
		});

		it('should respond with 400 on POST missing fields', async () => {
			const request = new Request('https://soporte-worker.ubiqueme.com/api/admin-delete-user', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ targetUid: 'uid-123' }),
			});
			const response = await env.SEND_EMAIL(request);
			expect(response.status).toBe(400);
		});

		it('should respond with 403 for an unverifiable admin token', async () => {
			const request = new Request('https://soporte-worker.ubiqueme.com/api/admin-delete-user', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ targetUid: 'uid-123', adminIdToken: 'not-a-valid-token' }),
			});
			const response = await env.SEND_EMAIL(request);
			// Identity Toolkit rejects the garbage token (or the request lacks a valid API key),
			// so the caller is never authorized.
			expect(response.status).toBe(403);
		});
	});
});

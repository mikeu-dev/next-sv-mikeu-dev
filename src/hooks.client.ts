import type { HandleClientError } from '@sveltejs/kit/hooks';

export const handleError: HandleClientError = async ({ error, event, kind }) => {
	const errorId = crypto.randomUUID();
	// `error` is only `{ status, message }` for 'app'/'framework' kinds; for 'unknown' it's whatever was thrown.
	const status = kind === 'unknown' ? 500 : error.status;
	const message =
		kind === 'unknown' ? (error instanceof Error ? error.message : 'Unknown error') : error.message;

	// Send error to our monitoring API
	// We use fetch with keepalive to ensure it reaches the server even if page is unloading
	try {
		await fetch('/api/monitoring', {
			method: 'POST',
			keepalive: true,
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				type: 'client',
				message,
				stack: kind === 'unknown' && error instanceof Error ? error.stack : undefined,
				url: window.location.href,
				userAgent: navigator.userAgent,
				status,
				context: {
					errorId,
					route: event.route.id || undefined
				}
			})
		});
	} catch (e) {
		// Fail silently
		console.error('Failed to send error to monitoring API', e);
	}

	return {
		message: 'An unexpected error occurred. Our team has been notified.',
		errorId
	};
};

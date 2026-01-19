/**
 * Safe error logging utility
 * Prevents sensitive data exposure in logs
 */

interface LogContext {
	[key: string]: unknown;
}

/**
 * Log error safely without exposing sensitive information
 * In production, this should integrate with error monitoring service (e.g., Sentry)
 */
export function logError(context: string, error: unknown, additionalContext?: LogContext): void {
	const timestamp = new Date().toISOString();
	const isProd = process.env.NODE_ENV === 'production';

	if (isProd) {
		// In production, log minimal information
		// TODO: Integrate with error monitoring service (Sentry, etc.)
		console.error(`[${timestamp}] [${context}] Error occurred`, {
			message: error instanceof Error ? error.message : 'Unknown error',
			context: additionalContext
		});

		// Example Sentry integration:
		// Sentry.captureException(error, {
		//   tags: { context },
		//   extra: additionalContext
		// });
	} else {
		// In development, log full error for debugging
		console.error(`[${timestamp}] [${context}]`, error, additionalContext);
	}
}

/**
 * Log warning message
 */
export function logWarning(context: string, message: string, additionalContext?: LogContext): void {
	const timestamp = new Date().toISOString();
	console.warn(`[${timestamp}] [${context}] ${message}`, additionalContext);
}

/**
 * Log info message
 */
export function logInfo(context: string, message: string, additionalContext?: LogContext): void {
	const timestamp = new Date().toISOString();
	console.info(`[${timestamp}] [${context}] ${message}`, additionalContext);
}

/**
 * Sanitize error for client response
 * Removes stack traces and sensitive information
 */
export function sanitizeError(error: unknown): { message: string } {
	if (error instanceof Error) {
		// Only return the message, not the stack trace
		return { message: error.message };
	}

	return { message: 'An unexpected error occurred' };
}

import type { RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

interface RateLimitRecord {
    count: number;
    resetAt: number;
}

/**
 * In-memory rate limit storage
 * For production, consider using Redis or similar distributed cache
 */
const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Clean up expired rate limit records periodically
 */
setInterval(
    () => {
        const now = Date.now();
        for (const [key, record] of rateLimitMap.entries()) {
            if (now > record.resetAt) {
                rateLimitMap.delete(key);
            }
        }
    },
    60000 // Clean up every minute
);

export interface RateLimitOptions {
    /** Maximum number of requests allowed in the time window */
    maxRequests: number;
    /** Time window in milliseconds */
    windowMs: number;
    /** Custom key generator function */
    keyGenerator?: (event: RequestEvent) => string;
    /** Custom error message */
    message?: string;
}

/**
 * Rate limiting middleware
 * 
 * @example
 * ```typescript
 * export async function POST(event: RequestEvent) {
 *   const rateLimitResult = checkRateLimit(event, { maxRequests: 5, windowMs: 60000 });
 *   if (rateLimitResult) return rateLimitResult;
 *   
 *   // Continue with normal request handling
 * }
 * ```
 */
export function checkRateLimit(
    event: RequestEvent,
    options: RateLimitOptions
): Response | null {
    const {
        maxRequests,
        windowMs,
        keyGenerator = (e) => e.getClientAddress(),
        message = 'Too many requests, please try again later'
    } = options;

    const key = keyGenerator(event);
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (record && now < record.resetAt) {
        if (record.count >= maxRequests) {
            // Rate limit exceeded
            return json(
                { message },
                {
                    status: 429,
                    headers: {
                        'Retry-After': Math.ceil((record.resetAt - now) / 1000).toString()
                    }
                }
            );
        }
        // Increment count
        record.count++;
    } else {
        // Create new record or reset expired one
        rateLimitMap.set(key, {
            count: 1,
            resetAt: now + windowMs
        });
    }

    return null; // No rate limit hit
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
    /** Strict rate limit for authentication endpoints */
    AUTH: { maxRequests: 5, windowMs: 60000 }, // 5 requests per minute

    /** Moderate rate limit for contact forms */
    CONTACT: { maxRequests: 3, windowMs: 300000 }, // 3 requests per 5 minutes

    /** Strict rate limit for file uploads */
    UPLOAD: { maxRequests: 10, windowMs: 60000 }, // 10 uploads per minute

    /** Lenient rate limit for general API endpoints */
    API: { maxRequests: 100, windowMs: 60000 } // 100 requests per minute
} as const;

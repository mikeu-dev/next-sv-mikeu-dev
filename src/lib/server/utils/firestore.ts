/**
 * Utility to prepare data for Firestore by removing undefined values
 * which are not supported by the Firebase SDK.
 */
export function sanitizeForFirestore<T>(data: T): T {
	const sanitize = (obj: unknown): unknown => {
		if (obj === null || typeof obj !== 'object') return obj;
		if (obj instanceof Date) return obj;
		if (Array.isArray(obj)) return obj.map((v) => sanitize(v));

		return Object.fromEntries(
			Object.entries(obj as Record<string, unknown>)
				.filter(([_, v]) => v !== undefined)
				.map(([k, v]) => [k, sanitize(v)])
		);
	};

	return sanitize(data) as T;
}

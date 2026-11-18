export const prerender = false;

import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const formData = await request.formData();
		const name = formData.get('name');
		const email = formData.get('email');
		const rawMessage = formData.get('message');
		const need = formData.get('need');
		// The "what do you need" chip is folded into the message so the existing
		// contact schema / inbox doesn't need a new field. Only added to a message
		// that already passes the length check, so the tag can't pad a too-short
		// message past validation.
		const message =
			typeof need === 'string' &&
			need.trim() &&
			typeof rawMessage === 'string' &&
			rawMessage.trim().length >= 10
				? `[${need.trim().slice(0, 60)}] ${rawMessage}`
				: rawMessage;
		const company = formData.get('company') || undefined;
		const budget = formData.get('budget') || undefined;

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ name, email, message, company, budget })
			});

			if (response.ok) {
				return { success: true, message: 'Your message has been sent successfully!' };
			} else {
				const errorData = await response.json();
				return { success: false, message: errorData.message || 'An error occurred.' };
			}
		} catch (error) {
			console.error('Form action error:', error);
			return { success: false, message: 'A network error occurred. Please try again.' };
		}
	}
};

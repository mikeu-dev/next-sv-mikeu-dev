export const prerender = false;

import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const formData = await request.formData();
		const name = formData.get('name');
		const email = formData.get('email');
		const message = formData.get('message');
		const company = formData.get('company');
		const budget = formData.get('budget');

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

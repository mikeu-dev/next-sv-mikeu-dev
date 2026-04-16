import { browser } from '$app/environment';
import type { DynamicIcon } from '$lib/types';
import { SvelteSet } from 'svelte/reactivity';

let registry = $state<Record<string, DynamicIcon>>({});
let loading = $state(false);
let initialized = $state(false);
const reported = new SvelteSet<string>();

/**
 * Global store for dynamic icons fetched from Firestore.
 * Using Svelte 5 runes for reactivity.
 */
export const customIconStore = {
	get registry() {
		return registry;
	},

	get loading() {
		return loading;
	},

	/**
	 * Initialize the store by fetching icons from the API.
	 * Only runs once on the client.
	 */
	async init() {
		if (!browser || initialized || loading) return;

		loading = true;
		try {
			const response = await fetch('/api/icons');
			if (!response.ok) throw new Error('Failed to fetch custom icons');

			const icons: DynamicIcon[] = await response.json();
			const newRegistry: Record<string, DynamicIcon> = {};

			icons.forEach((icon) => {
				newRegistry[icon.id] = icon;
				// Also support lowercase for robustness
				newRegistry[icon.id.toLowerCase()] = icon;
			});

			registry = newRegistry;
			initialized = true;
		} catch (error) {
			console.error('CustomIconStore init error:', error);
		} finally {
			loading = false;
		}
	},

	/**
	 * Report a missing icon to the server to trigger auto-sync.
	 * Uses a Set to avoid duplicate reports in the same session.
	 */
	async reportMissing(name: string) {
		if (!browser || !name || reported.has(name)) return;

		// Skip if already in registry
		if (registry[name] || registry[name.toLowerCase()]) return;

		reported.add(name);

		try {
			await fetch('/api/icons/report', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name })
			});
		} catch (error) {
			console.error('Error reporting missing icon:', error);
		}
	}
};

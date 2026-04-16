import { browser } from '$app/environment';
import type { DynamicIcon } from '$lib/types';

class CustomIconStore {
	#registry = $state<Record<string, DynamicIcon>>({});
	#loading = $state(false);
	#initialized = $state(false);

	get registry() {
		return this.#registry;
	}

	get loading() {
		return this.#loading;
	}

	async init() {
		if (!browser || this.#initialized || this.#loading) return;

		this.#loading = true;
		try {
			const response = await fetch('/api/icons');
			if (!response.ok) throw new Error('Failed to fetch custom icons');
			
			const icons: DynamicIcon[] = await response.json();
			const newRegistry: Record<string, DynamicIcon> = {};
			
			icons.forEach(icon => {
				newRegistry[icon.id] = icon;
				// Also support lowercase for robustness
				newRegistry[icon.id.toLowerCase()] = icon;
			});
			
			this.#registry = newRegistry;
			this.#initialized = true;
		} catch (error) {
			console.error('CustomIconStore init error:', error);
		} finally {
			this.#loading = false;
		}
	}
}

export const customIconStore = new CustomIconStore();

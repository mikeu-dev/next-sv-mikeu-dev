import { auth } from '$lib/firebase/firebase.client';
import { onAuthStateChanged, type User } from 'firebase/auth';

/**
 * Global authentication state utilizing Svelte 5 Runes logic.
 */
class AuthState {
	user: User | null = $state(null);
	initialized = $state(false);

	constructor() {
		this.init();
	}

	init() {
		if (typeof window !== 'undefined') {
			onAuthStateChanged(auth, (user) => {
				this.user = user;
				this.initialized = true;
			});
		}
	}
}

export const authState = new AuthState();

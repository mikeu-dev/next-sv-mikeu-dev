// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			paraglide: { locale: string };
			user?: any;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	interface Window {
		ScrollTrigger?: {
			refresh: () => void;
		};
		_gsapRegistered?: boolean;
	}
}

export {};

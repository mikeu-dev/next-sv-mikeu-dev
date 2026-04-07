/**
 * Interface for the BeforeInstallPromptEvent which is not yet 
 * part of the standard TypeScript DOM library.
 */
export interface BeforeInstallPromptEvent extends Event {
	readonly platforms: string[];
	readonly userChoice: Promise<{
		outcome: 'accepted' | 'dismissed';
		platform: string;
	}>;
	prompt(): Promise<void>;
}

/**
 * Global PWA state using Svelte 5 Runes.
 * Handles the 'beforeinstallprompt' event to manage app installation.
 */
class PWAState {
	// The captured event for triggering the installation prompt
	installPromptEvent: BeforeInstallPromptEvent | null = $state(null);
	
	// Whether the app is installable
	isInstallable = $derived(this.installPromptEvent !== null);

	/**
	 * Set the installation prompt event.
	 * @param event The BeforeInstallPromptEvent
	 */
	setInstallPrompt(event: BeforeInstallPromptEvent | null) {
		this.installPromptEvent = event;
	}

	/**
	 * Trigger the installation process.
	 */
	async install() {
		if (!this.installPromptEvent) return;

		// Show the install prompt
		await this.installPromptEvent.prompt();

		// Wait for the user to respond to the prompt
		const { outcome } = await this.installPromptEvent.userChoice;
		
		if (outcome === 'accepted') {
			// console.log('User accepted the install prompt');
			this.installPromptEvent = null;
		} else {
			// console.log('User dismissed the install prompt');
		}
	}
}

export const pwaState = new PWAState();

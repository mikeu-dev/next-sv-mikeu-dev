/**
 * Plays the confetti celebration sound effect.
 * Handles browser autoplay policy by queuing playback
 * until the first user interaction if autoplay is blocked.
 */

let pendingAudio: HTMLAudioElement | null = null;
let interactionController: AbortController | null = null;

function onFirstInteraction() {
	if (pendingAudio) {
		pendingAudio.play().catch(() => {});
		pendingAudio = null;
	}
	interactionController?.abort();
	interactionController = null;
}

export function playConfettiSound() {
	try {
		// Clean up any previous pending audio
		if (interactionController) {
			interactionController.abort();
			interactionController = null;
		}
		pendingAudio = null;

		const audio = new Audio('/sounds/confetti-sound.mp3');
		audio.volume = 0.5;

		const playPromise = audio.play();
		if (playPromise) {
			playPromise.catch(() => {
				// Autoplay blocked by browser policy —
				// queue to play on first user interaction
				pendingAudio = audio;
				interactionController = new AbortController();
				const opts: AddEventListenerOptions = { signal: interactionController.signal };
				document.addEventListener('click', onFirstInteraction, opts);
				document.addEventListener('touchstart', onFirstInteraction, opts);
				document.addEventListener('keydown', onFirstInteraction, opts);
			});
		}
	} catch {
		// Silently fail if Audio is not available (e.g., SSR)
	}
}

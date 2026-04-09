/**
 * Plays the confetti celebration sound effect.
 * Uses the Web Audio API for instant, low-latency playback.
 */
export function playConfettiSound() {
	try {
		const audio = new Audio('/sounds/confetti-sound.mp3');
		audio.volume = 0.5;
		audio.play().catch(() => {
			// Silently fail if autoplay is blocked by browser policy
		});
	} catch {
		// Silently fail if Audio is not available (e.g., SSR)
	}
}

/**
 * Plays the confetti celebration sound effect.
 *
 * The mp3 (~150 KB) is only fetched when it can actually play: before the
 * visitor has interacted with the page, browsers block autoplay, so the sound
 * is queued for the first interaction instead of being downloaded during the
 * initial page load. A queued sound is dropped if that interaction comes after
 * the confetti is long gone.
 */

const SOUND_URL = '/sounds/confetti-sound.mp3';
/** how long a queued sound stays relevant (the confetti runs ~5 s) */
const QUEUE_TTL_MS = 6000;

let interactionController: AbortController | null = null;

function play() {
	const audio = new Audio(SOUND_URL);
	audio.volume = 0.5;
	return audio.play();
}

function playOnFirstInteraction() {
	interactionController?.abort();
	const controller = new AbortController();
	interactionController = controller;
	const queuedAt = Date.now();

	const onInteraction = () => {
		controller.abort();
		if (interactionController === controller) interactionController = null;
		if (Date.now() - queuedAt <= QUEUE_TTL_MS) play().catch(() => {});
	};
	const opts: AddEventListenerOptions = { signal: controller.signal, once: true };
	document.addEventListener('click', onInteraction, opts);
	document.addEventListener('touchstart', onInteraction, opts);
	document.addEventListener('keydown', onInteraction, opts);
	setTimeout(() => controller.abort(), QUEUE_TTL_MS);
}

export function playConfettiSound() {
	try {
		interactionController?.abort();
		interactionController = null;

		// No interaction yet: autoplay would be blocked, so don't fetch the file now.
		const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } })
			.userActivation;
		if (activation && !activation.hasBeenActive) {
			playOnFirstInteraction();
			return;
		}

		play().catch(playOnFirstInteraction);
	} catch {
		// Audio unavailable (e.g. SSR)
	}
}

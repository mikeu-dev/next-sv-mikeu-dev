import { gsap } from 'gsap';

// Entry origins for each nav item — alternating left/right with slight skew
const ITEM_ORIGINS = [
	{ x: '-110vw', skewX: -5 },
	{ x: '110vw', skewX: 4 },
	{ x: '-110vw', skewX: -3 },
	{ x: '110vw', skewX: 5 },
	{ x: '-110vw', skewX: -4 },
	{ x: '110vw', skewX: 3 }
] as const;

export function createMenuTimeline(
	overlay: HTMLElement,
	navItems: HTMLElement[],
	gridBg: HTMLElement,
	controls: HTMLElement
): gsap.core.Timeline {
	// Set initial hidden state so nothing flashes on mount
	gsap.set(overlay, { autoAlpha: 0 });
	gsap.set(gridBg, { opacity: 0 });
	gsap.set(navItems, { opacity: 0 });
	gsap.set(controls, { opacity: 0, y: 28 });

	const tl = gsap.timeline({ paused: true });

	// Overlay fade-in
	tl.to(overlay, { autoAlpha: 1, duration: 0.3, ease: 'power2.inOut' }, 0);

	// Blueprint grid fade-in
	tl.to(gridBg, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.1);

	// Nav items fly in from alternating sides with skew
	navItems.forEach((item, i) => {
		const origin = ITEM_ORIGINS[i % ITEM_ORIGINS.length];
		tl.fromTo(
			item,
			{ x: origin.x, skewX: origin.skewX, opacity: 0 },
			{ x: 0, skewX: 0, opacity: 1, duration: 0.65, ease: 'expo.out' },
			0.08 + i * 0.065
		);
	});

	// Bottom controls slide up
	tl.to(controls, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 0.3);

	return tl;
}

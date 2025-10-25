// src/lib/components/guest/navbar/navbar.svelte.ts
import { gsap } from 'gsap';

export function setupGsapPendulum(
	anchorElement: HTMLAnchorElement,
	_header: HTMLElement,
	devSpan: HTMLElement
) {
	// Atur titik poros
	devSpan.style.transformOrigin = 'bottom right';

	// 🔽 Efek jatuh awal (seperti papan dilepas satu baut)
	gsap.fromTo(
		devSpan,
		{ rotate: 0 },
		{
			rotate: -25,
			duration: 1.2,
			ease: 'bounce.out',
		}
	);

	// 🪶 Efek hover (angkat sedikit)
	const hoverIn = () => {
		gsap.to(devSpan, {
			rotate: 0,
			duration: 0.5,
			ease: 'elastic.out(1, 0.5)',
		});
	};

	const hoverOut = () => {
		gsap.to(devSpan, {
			rotate: -25,
			duration: 0.8,
			ease: 'elastic.out(1, 0.4)',
		});
	};

	anchorElement.addEventListener('mouseenter', hoverIn);
	anchorElement.addEventListener('mouseleave', hoverOut);

	return () => {
		anchorElement.removeEventListener('mouseenter', hoverIn);
		anchorElement.removeEventListener('mouseleave', hoverOut);
	};
}

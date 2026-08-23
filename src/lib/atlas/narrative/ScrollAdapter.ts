import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { AtlasEngine } from '../core/AtlasEngine';

export function initializeAtlasScrollTrigger(
	containerElement: HTMLElement,
	engine: AtlasEngine
): () => void {
	gsap.registerPlugin(ScrollTrigger);

	const triggerInstance = ScrollTrigger.create({
		trigger: containerElement,
		start: 'top top',
		end: '+=4000', // 4000px scroll depth for rich 6-chapter spatial exploration
		pin: true,
		scrub: 0.4, // Silky smooth scrubbing without jitter
		anticipatePin: 1,
		onUpdate: (self) => {
			engine.setProgress(self.progress);
		}
	});

	return () => {
		triggerInstance.kill();
	};
}

import { onMount } from 'svelte';
import { writable, get } from 'svelte/store';

export function useWorkSection() {
	const workSection = writable<HTMLElement | null>(null);
	const projectCardElements = writable<HTMLElement[]>([]);
	const tooltipOpen = writable(false);
	const virtualAnchor = writable<{ getBoundingClientRect: () => DOMRect } | null>(null);
	const tooltipText = writable('Click and hover the cards to see interaction!');

	function createVirtualAnchor(x: number, y: number) {
		return { getBoundingClientRect: () => new DOMRect(x, y, 1, 1) };
	}

	onMount(() => {
		const section = get(workSection);
		if (!section) return;

		// Tooltip mouse move
		function handleMouseMove(event: MouseEvent) {
			virtualAnchor.set(createVirtualAnchor(event.clientX, event.clientY));
		}
		
		section.addEventListener('mousemove', handleMouseMove);

		return () => {
			section.removeEventListener('mousemove', handleMouseMove);
		};
	});

	return {
		workSection,
		projectCardElements,
		tooltipOpen,
		virtualAnchor,
		tooltipText
	};
}

<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { GEOM_ICON } from '../../map/project-geo.js';

	let { skills = [] }: { skills?: string[] } = $props();

	const FALLBACK = [
		'Leaflet',
		'OpenLayers',
		'Laravel',
		'SvelteKit',
		'Next.js',
		'CodeIgniter 4',
		'TypeScript',
		'React',
		'Tailwind CSS',
		'Filament',
		'MySQL',
		'Node.js',
		'Docker',
		'Git',
		'Firebase'
	];
	const ICONS = [GEOM_ICON.point, GEOM_ICON.line, GEOM_ICON.poly];

	let names = $derived(skills.length >= 6 ? skills : FALLBACK);
	// Rendered twice so the -50% translate loops seamlessly.
	let loop = $derived([...names, ...names]);
</script>

<div role="region" aria-label={m.gis_tech_label()} class="overflow-hidden py-[18px]">
	<ul class="map-marquee m-0 list-none gap-2.5 p-0">
		{#each loop as name, i (i)}
			<li
				aria-hidden={i >= names.length ? 'true' : undefined}
				class="flex items-center gap-2.5 bg-card py-2.5 pr-[18px] pl-3 text-base font-extrabold whitespace-nowrap shadow-[inset_0_0_0_1.5px_var(--panel-edge)] {i %
				2
					? 'rounded-leaf-r'
					: 'rounded-leaf'}"
			>
				<svg width="18" height="18" viewBox="0 0 22 22" aria-hidden="true">
					<path
						d={ICONS[i % 3]}
						fill={i % 3 === 2 ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : 'none'}
						stroke={i % 3 === 1 ? 'var(--route)' : 'var(--primary)'}
						stroke-width="2.2"
						stroke-linejoin="round"
						stroke-linecap="round"
					/>
				</svg>
				{name}
			</li>
		{/each}
	</ul>
</div>

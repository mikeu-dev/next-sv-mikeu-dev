<script lang="ts">
	import type { PageData } from './$types';
	import { m } from '#lib/paraglide/messages.js';
	import SEO from '#lib/components/seo/seo.svelte';
	import JejakMap from '#lib/components/guest/sections/jejak/jejak-map.svelte';

	let { data }: { data: PageData } = $props();
</script>

<SEO title={m.gis_world_title()} description={m.gis_world_lead()} />

<div class="pt-[88px] lg:pt-0">
	<JejakMap
		nodes={data.geoNodes}
		totalVisitors={data.stats.total}
		todayVisitors={data.stats.today}
	/>
</div>

<script lang="ts">
	import { page } from '$app/stores';

	type Props = {
		title?: string;
		description?: string;
		image?: string;
	};

	let { title, description, image }: Props = $props();

	const defaultTitle = 'Riki Ruswandi | Web & GIS Developer';
	const defaultDescription = 'A passionate Web & GIS Developer from Indonesia.';
	const siteUrl = $page.url.origin;
	const defaultImage = `${siteUrl}/preview.png`; // Assuming a default preview image exists in /static

	const finalTitle = title ? `${title} | Riki Ruswandi` : defaultTitle;
	const finalDescription = description || defaultDescription;
	const finalImage = image || defaultImage;
	const canonicalUrl = $page.url.href;
</script>

<svelte:head>
	<title>{finalTitle}</title>
	<meta name="description" content={finalDescription} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:title" content={finalTitle} />
	<meta property="og:description" content={finalDescription} />
	<meta property="og:image" content={finalImage} />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={canonicalUrl} />
	<meta property="twitter:title" content={finalTitle} />
	<meta property="twitter:description" content={finalDescription} />
	<meta property="twitter:image" content={finalImage} />
</svelte:head>

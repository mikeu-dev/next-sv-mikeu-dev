<script lang="ts">
	import { page } from '$app/state';

	type Props = {
		title?: string;
		description?: string;
		image?: string;
	};

	let { title, description, image }: Props = $props();

	const defaultTitle = 'Mikeu | Fullstack Web Developer';
	const defaultDescription = 'A passionate Fullstack Web Developer from Indonesia.';
	const siteUrl = page.url.origin;
	const defaultImage = `${siteUrl}/favicon.png`;

	const finalTitle = title ? `${title} | Mikeu` : defaultTitle;
	const finalDescription = description || defaultDescription;
	const finalImage = image || defaultImage;
	const canonicalUrl = page.url.href;
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

	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "WebSite",
			"name": "{finalTitle}",
			"url": "{canonicalUrl}",
			"description": "{finalDescription}",
			"image": "{finalImage}",
			"author": {
				"@type": "Person",
				"name": "Mikeu"
			}
		}
	</script>
</svelte:head>

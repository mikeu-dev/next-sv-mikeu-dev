<script lang="ts">
	import { page } from '$app/state';
	import { locales, baseLocale } from '$lib/paraglide/runtime';

	type Props = {
		title?: string;
		description?: string;
		image?: string;
		noindex?: boolean;
	};

	let { title, description, image, noindex = false }: Props = $props();

	const canonicalBase = 'https://www.mikeudev.my.id';
	const defaultTitle = 'Mikeu | Fullstack Web Developer';
	const defaultDescription = 'A passionate Fullstack Web Developer from Indonesia.';
	const siteUrl = canonicalBase;
	const defaultImage = `${siteUrl}/favicon.png`;

	const finalTitle = title ? `${title} | Mikeu` : defaultTitle;
	const finalDescription = description || defaultDescription;
	const finalImage = image || defaultImage;

	// Construct canonical URL using hardcoded domain to avoid non-www issues
	// Remove trailing slash except for root
	const path = page.url.pathname.replace(/\/$/, '') || '/';
	const canonicalUrl = `${canonicalBase}${path}`;

	// Generate alternate language links
	// 1. Get the "clean" path without locale prefix
	const pathSegments = page.url.pathname.split('/').filter(Boolean);
	if (pathSegments.length > 0 && locales.includes(pathSegments[0] as (typeof locales)[number])) {
		pathSegments.shift();
	}
	const cleanPath = '/' + pathSegments.join('/');

	const alternates = locales.map((locale) => {
		const isBase = locale === baseLocale;
		const localizedPath = isBase ? cleanPath : `/${locale}${cleanPath.replace(/\/$/, '')}`;
		return {
			locale,
			href: `${canonicalBase}${localizedPath.replace(/\/$/, '') || '/'}`
		};
	});
</script>

<svelte:head>
	<title>{finalTitle}</title>
	<meta name="description" content={finalDescription} />
	<link rel="canonical" href={canonicalUrl} />
	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{/if}

	{#each alternates as alt (alt.locale)}
		<link rel="alternate" hreflang={alt.locale} href={alt.href} />
	{/each}
	<link rel="alternate" hreflang="x-default" href={`${canonicalBase}${cleanPath.replace(/\/$/, '') || '/'}`} />

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

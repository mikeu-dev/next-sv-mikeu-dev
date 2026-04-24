<script lang="ts">
	import { page } from '$app/state';
	import { locales, baseLocale } from '$lib/paraglide/runtime';

	type Props = {
		title?: string;
		description?: string;
		image?: string;
		noindex?: boolean;
		type?: 'website' | 'article';
		article?: {
			publishedTime?: string;
			modifiedTime?: string;
			author?: string;
			tags?: string[];
		};
	};

	let { title, description, image, noindex = false, type = 'website', article }: Props = $props();

	const canonicalBase = 'https://www.mikeudev.my.id';
	const defaultTitle = 'Mikeu | Fullstack Web Developer';
	const defaultDescription = 'A passionate Fullstack Web Developer from Indonesia.';
	const siteUrl = canonicalBase;
	const finalTitle = title ? `${title} | Mikeu` : defaultTitle;
	const finalDescription = description || defaultDescription;

	// Use dynamic OG image if no specific image is provided
	const finalImage = $derived.by(() => {
		if (image) return image;
		const t = encodeURIComponent(title || 'Mikeu Dev');
		const s = encodeURIComponent(description || 'Fullstack Web Developer');
		return `${siteUrl}/api/og?title=${t}&subtitle=${s}`;
	});

	// Construct canonical URL using hardcoded domain to avoid non-www issues
	// Remove trailing slash except for root
	const path = page.url.pathname.replace(/\/$/, '');
	const canonicalUrl = path === '' ? `${canonicalBase}/` : `${canonicalBase}${path}`;

	// Generate alternate language links
	const pathSegments = page.url.pathname.split('/').filter(Boolean);
	if (pathSegments.length > 0 && locales.includes(pathSegments[0] as (typeof locales)[number])) {
		pathSegments.shift();
	}
	const cleanPath = '/' + pathSegments.join('/');

	const alternates = locales.map((locale) => {
		const isBase = locale === baseLocale;
		const localizedPath = isBase ? cleanPath : `/${locale}${cleanPath.replace(/\/$/, '')}`;
		const cleanLocPath = localizedPath.replace(/\/$/, '');
		return {
			locale,
			href: cleanLocPath === '' ? `${canonicalBase}/` : `${canonicalBase}${cleanLocPath}`
		};
	});

	// --- JSON-LD GENERATION ---
	const breadcrumbItems = pathSegments.map((segment, index) => {
		const partPath = '/' + pathSegments.slice(0, index + 1).join('/');
		return {
			'@type': 'ListItem',
			position: index + 1,
			name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
			item: `${canonicalBase}${partPath}`
		};
	});

	const jsonLd = $derived.by(() => {
		const graph: object[] = [
			{
				'@type': 'WebSite',
				name: 'Mikeu Dev',
				url: canonicalBase,
				description: defaultDescription
			}
		];

		if (breadcrumbItems.length > 0) {
			graph.push({
				'@type': 'BreadcrumbList',
				itemListElement: breadcrumbItems
			});
		}

		if (type === 'article') {
			graph.push({
				'@type': 'BlogPosting',
				headline: finalTitle.trim(),
				description: finalDescription.trim(),
				image: finalImage,
				datePublished: article?.publishedTime,
				dateModified: article?.modifiedTime || article?.publishedTime,
				author: {
					'@type': 'Person',
					name: (article?.author || 'Mikeu').trim()
				}
			});
		}

		return {
			'@context': 'https://schema.org',
			'@graph': graph
		};
	});

	const jsonLdScript = $derived(
		'<script type="application/ld+json">' + JSON.stringify(jsonLd) + '</' + 'script>'
	);
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
	<link
		rel="alternate"
		hreflang="x-default"
		href={cleanPath.replace(/\/$/, '') === ''
			? `${canonicalBase}/`
			: `${canonicalBase}${cleanPath.replace(/\/$/, '')}`}
	/>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={type === 'article' ? 'article' : 'website'} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:title" content={finalTitle} />
	<meta property="og:description" content={finalDescription} />
	<meta property="og:image" content={finalImage} />
	{#if type === 'article' && article?.publishedTime}
		<meta property="article:published_time" content={article.publishedTime} />
	{/if}

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={canonicalUrl} />
	<meta property="twitter:title" content={finalTitle} />
	<meta property="twitter:description" content={finalDescription} />
	<meta property="twitter:image" content={finalImage} />

	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonLdScript}
</svelte:head>

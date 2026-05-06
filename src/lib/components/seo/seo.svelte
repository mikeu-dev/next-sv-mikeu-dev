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
		if (image) {
			// If it's already an absolute URL, return it
			if (image.startsWith('http')) return image;
			// If it's a relative URL starting with /, prepend the site URL
			if (image.startsWith('/')) return `${siteUrl}${image}`;
			// Otherwise return as is
			return image;
		}
		// Fallback to static PNG for better compatibility with WhatsApp/Social Media
		// SVG images (from /api/og) are often not supported by link crawlers
		return `${siteUrl}/images/og-default.png`;
	});

	// Construct canonical URL using hardcoded domain to avoid non-www issues
	// Remove trailing slash except for root
	const canonicalUrl = $derived.by(() => {
		const path = page.url.pathname.replace(/\/$/, '');
		return path === '' ? `${canonicalBase}/` : `${canonicalBase}${path}`;
	});

	// Generate alternate language links
	const alternatesData = $derived.by(() => {
		const pathSegments = page.url.pathname.split('/').filter(Boolean);
		if (pathSegments.length > 0 && locales.includes(pathSegments[0] as (typeof locales)[number])) {
			pathSegments.shift();
		}
		const cleanPath = '/' + pathSegments.join('/');

		const list = locales.map((locale) => {
			const isBase = locale === baseLocale;
			const localizedPath = isBase ? cleanPath : `/${locale}${cleanPath.replace(/\/$/, '')}`;
			const cleanLocPath = localizedPath.replace(/\/$/, '');
			return {
				locale,
				href: cleanLocPath === '' ? `${canonicalBase}/` : `${canonicalBase}${cleanLocPath}`
			};
		});

		const xDefault =
			cleanPath.replace(/\/$/, '') === ''
				? `${canonicalBase}/`
				: `${canonicalBase}${cleanPath.replace(/\/$/, '')}`;

		return { list, xDefault };
	});

	// --- JSON-LD GENERATION ---
	const jsonLd = $derived.by(() => {
		const pathSegments = page.url.pathname.split('/').filter(Boolean);
		if (pathSegments.length > 0 && locales.includes(pathSegments[0] as (typeof locales)[number])) {
			pathSegments.shift();
		}

		const breadcrumbItems = pathSegments.map((segment, index) => {
			const partPath = '/' + pathSegments.slice(0, index + 1).join('/');
			return {
				'@type': 'ListItem',
				position: index + 1,
				name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
				item: `${canonicalBase}${partPath}`
			};
		});

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

	{#each alternatesData.list as alt (alt.locale)}
		<link rel="alternate" hreflang={alt.locale} href={alt.href} />
	{/each}
	<link rel="alternate" hreflang="x-default" href={alternatesData.xDefault} />

	<!-- Open Graph / Facebook -->
	<meta property="og:site_name" content="Mikeu Dev" />
	<meta property="og:type" content={type === 'article' ? 'article' : 'website'} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:title" content={finalTitle} />
	<meta property="og:description" content={finalDescription} />

	<!-- Primary OG Image (1200x630) -->
	<meta property="og:image" content={finalImage} />
	<meta property="og:image:secure_url" content={finalImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:type" content="image/png" />

	<!-- WhatsApp/Square Thumbnail (300x300) -->
	<meta property="og:image" content="{siteUrl}/images/og-default.png" />
	<meta property="og:image:width" content="300" />
	<meta property="og:image:height" content="300" />

	{#if type === 'article' && article?.publishedTime}
		<meta property="article:published_time" content={article.publishedTime} />
	{/if}

	<!-- Microsoft / Microsoft Apps -->
	<meta name="msapplication-TileImage" content="{siteUrl}/images/og-default.png" />
	<meta name="msapplication-TileColor" content="#0f172a" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={canonicalUrl} />
	<meta name="twitter:title" content={finalTitle} />
	<meta name="twitter:description" content={finalDescription} />
	<meta name="twitter:image" content={finalImage} />
	<meta name="twitter:site" content="@mikeu_dev" />
	<meta name="twitter:creator" content="@mikeu_dev" />

	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonLdScript}
</svelte:head>

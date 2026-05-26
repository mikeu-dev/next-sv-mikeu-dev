import { db } from '$lib/server/firebase/firebase.server';
import { COLLECTIONS } from '$lib/server/firebase/collections';
import type { BlogPost } from '$lib/types';

const NEW_POSTS: Omit<BlogPost, 'id'>[] = [
	// --- Post 1: Performance ---
	{
		slug: 'mastering-sveltekit-performance',
		locale: 'en',
		title: 'Mastering SvelteKit Performance: A Professional Guide',
		description:
			'Learn how to optimize your SvelteKit applications for lightning-fast load times, perfect Core Web Vitals, and outstanding search engine rankings.',
		date: '2026-05-26',
		published: true,
		thumbnailUrl:
			'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
		tags: ['SvelteKit', 'Performance', 'WebDev', 'SEO'],
		readingTime: 8,
		content: `
## Introduction

In the modern web ecosystem, page performance is no longer a luxury—it is a critical business metric. Slow loading speeds directly impact conversion rates, bounce rates, and overall user engagement. With Google's ranking algorithm placing heavy emphasis on **Core Web Vitals** (specifically LCP, INP, and CLS), optimizing your SvelteKit application is paramount to succeeding in both search engine rankings and user satisfaction.

SvelteKit is fundamentally engineered for performance out of the box, utilizing Svelte's compile-time design to avoid heavy runtime engines. However, developers must still understand and apply advanced optimization techniques to unlock the framework's full potential.

---

## 1. Smart Preloading Strategies

One of SvelteKit's most powerful native features is its intelligent data and code preloading capabilities. By default, SvelteKit allows you to preload the code and data necessary for a page before the user actually clicks a link.

To control this behavior, SvelteKit provides the ___BACKTICK___data-sveltekit-preload-data___BACKTICK___ and ___BACKTICK___data-sveltekit-preload-code___BACKTICK___ attributes. These can be placed on individual anchor tags or parent elements like ___BACKTICK___<body>___BACKTICK___ or ___BACKTICK___<nav>___BACKTICK___.

### Comparison of Preload Options

| Preload Value | Trigger Mechanic | Recommended Use Case |
| :--- | :--- | :--- |
| ___BACKTICK___"hover"___BACKTICK___ | Initiates preload when the user hovers their cursor over the link. | Default setting. Excellent for high-speed navigation. |
| ___BACKTICK___"tap"___BACKTICK___ | Preloads as soon as the user presses down, resolving before the click completes. | Ideal for mobile devices and high-throughput databases. |
| ___BACKTICK___"viewport"___BACKTICK___ | Preloads when the link enters the viewport. | Use selectively for high-probability target links (e.g. Next page). |
| ___BACKTICK___"off"___BACKTICK___ | Disables preloading completely. | Essential for heavy operations or write actions. |

> **Pro Tip:** Never use ___BACKTICK___"viewport"___BACKTICK___ for pages that run highly intensive database queries on load. This can cause unnecessary server strain as users scroll through long list indexes.

---

## 2. Advanced Image Optimization

Images typically make up the vast majority of a page's weight. Serving uncompressed, raw images is a guaranteed way to spike your Largest Contentful Paint (LCP) and fail performance benchmarks.

To implement professional-grade image management in SvelteKit:

1. **Serve Modern Formats:** Always convert source images to highly compressed modern formats like **WebP** or **AVIF**.
2. **Utilize Responsive Srcset:** Provide multiple sizes of the same image so mobile users are not downloading desktop-grade files.
3. **Prevent Cumulative Layout Shift (CLS):** Always set explicit dimensions (___BACKTICK___width___BACKTICK___ and ___BACKTICK___height___BACKTICK___) or utilize an aspect-ratio container.

Here is a Svelte 5 responsive image component implementation:

___BACKTICK______BACKTICK______BACKTICK___svelte
<script lang="ts">
	let { src, alt, width, height } = $props<{
		src: string;
		alt: string;
		width: number;
		height: number;
	}>();
</script>

<div class="image-container" style="aspect-ratio: {width} / {height}">
	<img
		{src}
		{alt}
		{width}
		{height}
		loading="lazy"
		decoding="async"
		class="optimized-image"
	/>
</div>

<style>
	.image-container {
		position: relative;
		overflow: hidden;
		background-color: var(--muted-bg);
	}
	.optimized-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: opacity 0.3s ease-in-out;
	}
</style>
___BACKTICK______BACKTICK______BACKTICK___

---

## 3. Progressive Enhancement with SvelteKit Actions

A common pitfall in modern Javascript applications is relying heavily on client-side ___BACKTICK___fetch___BACKTICK___ requests to submit forms. If the client has a spotty network connection, the application may appear broken or unresponsive.

SvelteKit provides native support for **Form Actions**, allowing developers to write secure, server-side handlers that execute seamlessly. By layering on the ___BACKTICK___use:enhance___BACKTICK___ directive, we can implement **Progressive Enhancement**. This ensures your forms function perfectly without Javascript, while providing an enriched, instantaneous experience when Javascript is active.

___BACKTICK______BACKTICK______BACKTICK___svelte
<script lang="ts">
	import { enhance } from '$app/forms';
	let loading = $state(false);
</script>

<form
	method="POST"
	action="?/submitFeedback"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			loading = false;
			await update();
		};
	}}
	class="form-brutalist"
>
	<label for="comment">Submit Feedback</label>
	<textarea id="comment" name="comment" required></textarea>
	
	<button type="submit" disabled={loading}>
		{loading ? 'Submitting...' : 'Send'}
	</button>
</form>
___BACKTICK______BACKTICK______BACKTICK___

---

## 4. Edge Middleware and CDN Caching

To scale your SvelteKit applications to thousands of concurrent users, you should avoid executing heavy database calls on every page load. Instead, use edge caching via response headers.

In your server-side loader file (___BACKTICK___+page.server.ts___BACKTICK___), you can define explicit cache-control guidelines:

___BACKTICK______BACKTICK______BACKTICK___typescript
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({
		'cache-control': 'public, max-age=60, s-maxage=600, stale-while-revalidate=30'
	});

	const data = await fetchHeavyDataset();
	return { data };
};
___BACKTICK______BACKTICK______BACKTICK___

This setup ensures that browsers cache the content for 60 seconds, and CDN Edge nodes cache it for 10 minutes, massively reducing the database strain while maintaining high availability.

---

## Conclusion

Mastering SvelteKit performance requires a multi-layered approach. By leveraging built-in preloading tools, enforcing strict image layouts, utilizing progressive forms, and setting smart cache headers, your application will load instantly, provide exceptional Core Web Vitals, and dominate search engine results.
		`.trim()
	},
	{
		slug: 'mastering-sveltekit-performance',
		locale: 'id',
		title: 'Optimasi Performa SvelteKit: Panduan Profesional',
		description:
			'Pelajari cara mengoptimalkan aplikasi SvelteKit Anda untuk waktu pemuatan yang sangat cepat, Core Web Vitals yang sempurna, dan peringkat SEO terbaik.',
		date: '2026-05-26',
		published: true,
		thumbnailUrl:
			'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
		tags: ['SvelteKit', 'Performa', 'WebDev', 'SEO'],
		readingTime: 8,
		content: `
## Pendahuluan

Dalam ekosistem web modern, performa sebuah halaman web bukan lagi sekadar pelengkap—ini adalah metrik bisnis yang krusial. Waktu pemuatan situs yang lambat akan berdampak buruk secara langsung pada rasio konversi (*conversion rate*), rasio pentalan (*bounce rate*), dan keterlibatan pengguna secara keseluruhan. Dengan algoritma pencarian Google yang sangat menekankan pada **Core Web Vitals** (khususnya LCP, INP, dan CLS), mengoptimalkan aplikasi SvelteKit Anda adalah hal utama untuk memenangkan peringkat mesin pencari dan kenyamanan pengguna.

Secara fundamental, SvelteKit telah dirancang untuk memiliki performa tinggi sejak awal dengan memanfaatkan arsitektur kompilasi Svelte yang menghindari mesin runtime yang berat. Namun, para pengembang harus tetap memahami dan menerapkan teknik optimasi tingkat lanjut guna memanfaatkan potensi penuh dari kerangka kerja ini.

---

## 1. Strategi Preloading yang Cerdas

Salah satu fitur bawaan paling kuat di SvelteKit adalah kemampuan pengambilan kode dan data secara proaktif sebelum pengguna mengklik tautan (*intelligent preloading*).

Untuk mengontrol perilaku ini, SvelteKit menyediakan atribut ___BACKTICK___data-sveltekit-preload-data___BACKTICK___ dan ___BACKTICK___data-sveltekit-preload-code___BACKTICK___. Atribut ini dapat disematkan langsung pada tag jangkar (*anchor tag*) individual maupun pada elemen induk seperti ___BACKTICK___<body>___BACKTICK___ atau ___BACKTICK___<nav>___BACKTICK___.

### Perbandingan Opsi Pengambilan Data (Preload)

| Nilai Preload | Mekanisme Pemicu | Rekomendasi Kasus Penggunaan |
| :--- | :--- | :--- |
| ___BACKTICK___"hover"___BACKTICK___ | Proses pengambilan dimulai saat kursor pengguna berada di atas tautan. | Pengaturan bawaan. Sangat baik untuk navigasi berkecepatan tinggi. |
| ___BACKTICK___"tap"___BACKTICK___ | Pengambilan dimulai saat layar ditekan, selesai sebelum klik tuntas. | Sangat ideal untuk perangkat seluler dan database dengan latensi rendah. |
| ___BACKTICK___"viewport"___BACKTICK___ | Pengambilan dimulai segera setelah tautan terlihat di layar. | Gunakan secara selektif pada tautan yang sangat penting (misal: tombol Next). |
| ___BACKTICK___"off"___BACKTICK___ | Menonaktifkan proses preloading sepenuhnya. | Wajib untuk operasi berat atau aksi penulisan data (*write actions*). |

> **Tip Profesional:** Jangan pernah menggunakan opsi ___BACKTICK___"viewport"___BACKTICK___ untuk halaman yang menjalankan kueri database sangat intensif. Ini dapat menyebabkan beban server melonjak tanpa alasan saat pengguna melakukan gulir (*scrolling*) di halaman indeks.

---

## 2. Optimasi Gambar Tingkat Lanjut

Gambar biasanya merupakan komponen terberat dalam sebuah halaman web. Mengirimkan gambar mentah tanpa kompresi adalah cara tercepat untuk merusak metrik Largest Contentful Paint (LCP) Anda dan menggagalkan penilaian performa Core Web Vitals.

Untuk menerapkan pengelolaan gambar profesional di SvelteKit:

1. **Gunakan Format Modern:** Selalu konversikan gambar mentah ke format modern seperti **WebP** atau **AVIF**.
2. **Gunakan Atribut Srcset Responsif:** Sediakan beberapa ukuran gambar agar pengguna perangkat seluler tidak perlu mengunduh file berukuran desktop.
3. **Cegah Cumulative Layout Shift (CLS):** Tentukan dimensi lebar (___BACKTICK___width___BACKTICK___) dan tinggi (___BACKTICK___height___BACKTICK___) secara eksplisit atau manfaatkan kontainer *aspect-ratio*.

Berikut adalah contoh implementasi komponen gambar responsif di Svelte 5:

___BACKTICK______BACKTICK______BACKTICK___svelte
<script lang="ts">
	let { src, alt, width, height } = $props<{
		src: string;
		alt: string;
		width: number;
		height: number;
	}>();
</script>

<div class="image-container" style="aspect-ratio: {width} / {height}">
	<img
		{src}
		{alt}
		{width}
		{height}
		loading="lazy"
		decoding="async"
		class="optimized-image"
	/>
</div>

<style>
	.image-container {
		position: relative;
		overflow: hidden;
		background-color: var(--muted-bg);
	}
	.optimized-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: opacity 0.3s ease-in-out;
	}
</style>
___BACKTICK______BACKTICK______BACKTICK___

---

## 3. Progressive Enhancement Menggunakan Form Actions

Salah satu kebiasaan buruk dalam aplikasi web modern adalah ketergantungan yang berlebihan pada pemanggilan fungsi client-side ___BACKTICK___fetch___BACKTICK___ untuk mengirimkan data formulir. Ketika pengguna memiliki jaringan yang kurang stabil, aplikasi akan tampak tidak responsif atau rusak.

SvelteKit menawarkan fitur **Form Actions** bawaan, memungkinkan pengembang menulis logika sisi server secara aman. Dengan menerapkan direktif ___BACKTICK___use:enhance___BACKTICK___, kita dapat menghadirkan konsep **Progressive Enhancement**. Hal ini memastikan formulir Anda tetap berfungsi dengan sempurna tanpa JavaScript, dan secara instan memberikan pengalaman interaktif yang mulus ketika JavaScript aktif.

___BACKTICK______BACKTICK______BACKTICK___svelte
<script lang="ts">
	import { enhance } from '$app/forms';
	let loading = $state(false);
</script>

<form
	method="POST"
	action="?/submitFeedback"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			loading = false;
			await update();
		};
	}}
	class="form-brutalist"
>
	<label for="comment">Kirim Umpan Balik</label>
	<textarea id="comment" name="comment" required></textarea>
	
	<button type="submit" disabled={loading}>
		{loading ? 'Mengirim...' : 'Kirim'}
	</button>
</form>
___BACKTICK______BACKTICK______BACKTICK___

---

## 4. Edge Middleware dan Caching di Level CDN

Untuk mendukung skalabilitas hingga ribuan pengguna aktif secara bersamaan, hindari kueri database yang berat pada setiap muatan halaman. Sebaliknya, manfaatkan *edge caching* menggunakan respon header HTTP.

Pada berkas loader sisi server Anda (___BACKTICK___+page.server.ts___BACKTICK___), Anda dapat mengonfigurasi pedoman kontrol cache berikut:

___BACKTICK______BACKTICK______BACKTICK___typescript
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({
		'cache-control': 'public, max-age=60, s-maxage=600, stale-while-revalidate=30'
	});

	const data = await fetchHeavyDataset();
	return { data };
};
___BACKTICK______BACKTICK______BACKTICK___

Dengan konfigurasi ini, peramban akan menyimpan data selama 60 detik, dan server CDN Edge akan menahannya selama 10 menit. Hal ini sangat menghemat beban kueri database sekaligus memastikan kecepatan muatan situs yang luar biasa.

---

## Kesimpulan

Menguasai performa SvelteKit membutuhkan pendekatan yang komprehensif. Dengan memanfaatkan strategi *preloading* yang tepat, penentuan dimensi gambar yang ketat, formulir progresif, dan *cache header* yang cerdas, aplikasi Anda akan dimuat secara instan, menyajikan Core Web Vitals terbaik, dan mendominasi peringkat mesin pencarian.
		`.trim()
	},

	// --- Post 2: SEO ---
	{
		slug: 'portfolio-seo-guide',
		locale: 'en',
		title: "The Developer's Guide to Portfolio SEO",
		description:
			'How to optimize your developer portfolio to rank higher in search engines, stand out to recruiters, and drive organic client inquiries.',
		date: '2026-05-25',
		published: true,
		thumbnailUrl:
			'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=800&auto=format&fit=crop',
		tags: ['SEO', 'Career', 'Portfolio', 'WebDev'],
		readingTime: 6,
		content: `
## Introduction

For digital product developers and designers, a portfolio website is more than just a list of past works—it is a functional showcase of your engineering capabilities and a primary channel for business opportunities. However, even the most beautiful Brutalist design or high-performance 3D visualization is useless if recruiters or potential clients cannot find your site in search results.

Applying SEO (Search Engine Optimization) fundamentals ensures that your portfolio acts as a organic magnet for prospective clients. This guide will walk you through professional SEO practices, focusing on semantic structures, proper metadata setups, dynamic JSON-LD discovery, and multi-language discovery.

---

## 1. Enforcing Semantic HTML Structure

Search engine crawlers, such as Googlebot, parse your site's source code to understand its structural value. If your portfolio is built entirely out of unsemantic ___BACKTICK___<div>___BACKTICK___ containers, you are hiding critical data relationships from search engines.

Using proper HTML5 semantic elements clarifies the visual hierarchy of your pages.

### HTML5 Landmarks and Rules

- **Use a single ___BACKTICK___<h1>___BACKTICK___ per page:** This acts as the primary focal point of the page. It must contain your core topic or primary keyword.
- **Maintain Strict Heading Hierarchies:** Never jump from an ___BACKTICK___<h2>___BACKTICK___ directly to an ___BACKTICK___<h4>___BACKTICK___. Headings define sections and sub-sections, not styles.
- **Utilize Semantic Landmarks:** Wrap layouts in ___BACKTICK___<header>___BACKTICK___, ___BACKTICK___<nav>___BACKTICK___, ___BACKTICK___<main>___BACKTICK___, ___BACKTICK___<section>___BACKTICK___, and ___BACKTICK___<footer>___BACKTICK___.
- **Use Descriptive Link Texts:** Never use "click here" or "read more". Instead, write descriptive, keywords-focused anchor links like "View the Emameun Project Case Study".

---

## 2. Meta Tags and Social Previews

Whenever your pages are shared on social channels or crawled by search engines, meta tags dictate exactly how they are formatted. Adding robust **Open Graph (OG)** and **Twitter Card** tags dramatically increases Click-Through Rates (CTR).

In your Svelte projects, you should encapsulate this in a clean, reusable SEO component:

___BACKTICK______BACKTICK______BACKTICK___svelte
<!-- src/lib/components/seo/seo.svelte -->
<script lang="ts">
	import { page } from '$app/state';

	let {
		title = 'Mikeu Dev | Portfolio',
		description = 'High-Performance Fullstack Portfolio',
		ogImage = 'https://www.mikeudev.my.id/og-default.png'
	} = $props<{
		title?: string;
		description?: string;
		ogImage?: string;
	}>();

	let canonicalUrl = $derived(page.url.origin + page.url.pathname);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonicalUrl} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={ogImage} />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={canonicalUrl} />
	<meta property="twitter:title" content={title} />
	<meta property="twitter:description" content={description} />
	<meta property="twitter:image" content={ogImage} />
</svelte:head>
___BACKTICK______BACKTICK______BACKTICK___

---

## 3. Dynamic JSON-LD Structured Data

Structured Data (JSON-LD) is a standardized format that provides explicit clues about the meaning of a page. By injecting JSON-LD schemas, you allow Google to represent your portfolio as rich, detailed search listings, displaying ratings, work details, or professional profiles directly in the search index.

For a developer portfolio, a **ProfilePage** or **CreativeWork** schema is highly recommended.

Here is how you inject JSON-LD safely inside Svelte:

___BACKTICK______BACKTICK______BACKTICK___svelte
<script lang="ts">
	const schema = {
		"@context": "https://schema.org",
		"@type": "ProfilePage",
		"mainEntity": {
			"@type": "Person",
			"name": "Riki Ruswandi",
			"alternateName": "Mikeu Dev",
			"jobTitle": "Fullstack Software Engineer",
			"url": "https://www.mikeudev.my.id",
			"sameAs": [
				"https://github.com/rikiruswandi",
				"https://linkedin.com/in/rikiruswandi"
			]
		}
	};

	let serializedSchema = JSON.stringify(schema);
</script>

<svelte:head>
	{@html '<script type="application/ld+json">' + serializedSchema + '</script>'}
</svelte:head>
___BACKTICK______BACKTICK______BACKTICK___

---

## 4. Multi-Language SEO (hreflang)

If your portfolio supports multiple languages (e.g., English and Indonesian), search engines must understand which version to serve to specific audiences. If done incorrectly, crawlers might penalize your site for duplicate content.

To resolve this, you must output explicit ___BACKTICK___hreflang___BACKTICK___ alternate tags in your header for each supported locale, plus an ___BACKTICK___x-default___BACKTICK___ fallback link:

___BACKTICK______BACKTICK______BACKTICK___html
<link rel="alternate" hreflang="en" href="https://www.mikeudev.my.id/blog/post-slug" />
<link rel="alternate" hreflang="id" href="https://www.mikeudev.my.id/id/blog/post-slug" />
<link rel="alternate" hreflang="x-default" href="https://www.mikeudev.my.id/blog/post-slug" />
___BACKTICK______BACKTICK______BACKTICK___

This tells search engines exactly how the translations align, ensuring the appropriate language version is displayed based on the searcher's geographic region.

---

## Conclusion

SEO is not about gaming search algorithms; it is about providing crawlable clarity. By writing clean semantic layouts, serving optimized social previews, injecting profile-level structured schemas, and specifying translation relationships, you ensure your portfolio stands out to search engines and clients alike.
		`.trim()
	},
	{
		slug: 'portfolio-seo-guide',
		locale: 'id',
		title: 'Panduan SEO Portfolio untuk Developer',
		description:
			'Cara mengoptimalkan portfolio developer Anda agar mendapatkan peringkat lebih tinggi di mesin pencari, menonjol di hadapan rekruter, dan menarik klien potensial.',
		date: '2026-05-25',
		published: true,
		thumbnailUrl:
			'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=800&auto=format&fit=crop',
		tags: ['SEO', 'Karier', 'Portfolio', 'WebDev'],
		readingTime: 6,
		content: `
## Pendahuluan

Bagi pengembang perangkat lunak maupun desainer produk digital, situs web portfolio bukan sekadar daftar riwayat pekerjaan masa lalu—ini adalah media fungsional yang menunjukkan kapabilitas rekayasa teknis Anda sekaligus saluran bisnis utama untuk peluang baru. Namun, desain Brutalist yang luar biasa atau visualisasi 3D yang sangat interaktif sekalipun akan sia-sia jika rekruter atau calon klien tidak dapat menemukan situs Anda di mesin pencari.

Menerapkan dasar-dasar SEO (Search Engine Optimization) memastikan portfolio Anda berfungsi sebagai penarik minat (*organic magnet*) bagi calon klien. Panduan ini akan membimbing Anda melalui praktik SEO profesional, dengan fokus pada struktur HTML semantik, pengaturan deskripsi meta yang tepat, injeksi JSON-LD dinamis, dan integrasi multi-bahasa.

---

## 1. Menegakkan Struktur HTML Semantik

Mesin perayap (*crawlers*) seperti Googlebot menganalisis kode sumber situs web Anda untuk memahami nilai struktural halaman tersebut. Jika portfolio Anda dibangun seluruhnya menggunakan kontainer ___BACKTICK___<div>___BACKTICK___ generik tanpa makna, Anda menyembunyikan hubungan data yang penting dari mesin pencari.

Penggunaan elemen semantik HTML5 memperjelas hierarki visual halaman Anda.

### Aturan Utama Elemen Semantik HTML5

- **Gunakan hanya satu ___BACKTICK___<h1>___BACKTICK___ per halaman:** Ini bertindak sebagai titik fokus utama dari topik halaman tersebut. Elemen ini harus memuat kata kunci utama Anda.
- **Pelihara Hierarki Heading yang Ketat:** Jangan pernah melompat dari tag ___BACKTICK___<h2>___BACKTICK___ langsung ke ___BACKTICK___<h4>___BACKTICK___. Heading digunakan untuk menyusun bagian dan sub-bagian konten, bukan untuk mengubah ukuran teks.
- **Manfaatkan Penanda Semantik:** Bungkus tata letak Anda dalam elemen ___BACKTICK___<header>___BACKTICK___, ___BACKTICK___<nav>___BACKTICK___, ___BACKTICK___<main>___BACKTICK___, ___BACKTICK___<section>___BACKTICK___, dan ___BACKTICK___<footer>___BACKTICK___.
- **Gunakan Teks Tautan yang Jelas:** Hindari penulisan tautan generik seperti "klik di sini" atau "baca selengkapnya". Sebaliknya, tulis kalimat deskriptif yang berorientasi pada kata kunci seperti "Lihat Studi Kasus Proyek Emameun".

---

## 2. Meta Tags dan Pratinjau Media Sosial

Setiap kali halaman Anda dibagikan di media sosial atau dipindai oleh mesin pencari, meta tag menentukan bagaimana konten tersebut ditampilkan. Menambahkan tag **Open Graph (OG)** and **Twitter Card** yang lengkap secara dramatis meningkatkan Click-Through Rate (CTR).

Di dalam proyek Svelte Anda, sebaiknya bungkus logika ini dalam sebuah komponen SEO yang dapat digunakan kembali:

___BACKTICK______BACKTICK______BACKTICK___svelte
<!-- src/lib/components/seo/seo.svelte -->
<script lang="ts">
	import { page } from '$app/state';

	let {
		title = 'Mikeu Dev | Portfolio',
		description = 'High-Performance Fullstack Portfolio',
		ogImage = 'https://www.mikeudev.my.id/og-default.png'
	} = $props<{
		title?: string;
		description?: string;
		ogImage?: string;
	}>();

	let canonicalUrl = $derived(page.url.origin + page.url.pathname);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonicalUrl} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={ogImage} />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={canonicalUrl} />
	<meta property="twitter:title" content={title} />
	<meta property="twitter:description" content={description} />
	<meta property="twitter:image" content={ogImage} />
</svelte:head>
___BACKTICK______BACKTICK______BACKTICK___

---

## 3. Data Terstruktur JSON-LD Dinamis

Data Terstruktur (JSON-LD) adalah format standar untuk memberikan petunjuk eksplisit tentang makna sebuah halaman web. Dengan menginjeksikan skema JSON-LD, Anda memungkinkan Google merepresentasikan portfolio Anda sebagai hasil pencarian kaya (*rich results*), seperti menampilkan informasi rating, detail pekerjaan, atau profil profesional Anda langsung di dalam halaman pencarian Google.

Untuk portfolio pengembang, jenis skema **ProfilePage** atau **CreativeWork** sangat disarankan.

Berikut cara menginjeksikan data skema JSON-LD secara aman di Svelte:

___BACKTICK______BACKTICK______BACKTICK___svelte
<script lang="ts">
	const schema = {
		"@context": "https://schema.org",
		"@type": "ProfilePage",
		"mainEntity": {
			"@type": "Person",
			"name": "Riki Ruswandi",
			"alternateName": "Mikeu Dev",
			"jobTitle": "Fullstack Software Engineer",
			"url": "https://www.mikeudev.my.id",
			"sameAs": [
				"https://github.com/rikiruswandi",
				"https://linkedin.com/in/rikiruswandi"
			]
		}
	};

	let serializedSchema = JSON.stringify(schema);
</script>

<svelte:head>
	{@html '<script type="application/ld+json">' + serializedSchema + '</script>'}
</svelte:head>
___BACKTICK______BACKTICK______BACKTICK___

---

## 4. SEO untuk Situs Multi-Bahasa (hreflang)

Jika portfolio Anda mendukung lebih dari satu bahasa (misalnya, bahasa Inggris dan Indonesia), mesin pencari harus tahu halaman mana yang harus disajikan kepada pengguna di wilayah tertentu. Jika tidak disetel dengan benar, perayap dapat mendeteksi situs Anda sebagai konten duplikat (*duplicate content*).

Untuk mengatasinya, Anda harus mempublikasikan tag ___BACKTICK___hreflang___BACKTICK___ alternatif di bagian header untuk setiap varian bahasa yang didukung, beserta tautan cadangan ___BACKTICK___x-default___BACKTICK___:

___BACKTICK______BACKTICK______BACKTICK___html
<link rel="alternate" hreflang="en" href="https://www.mikeudev.my.id/blog/post-slug" />
<link rel="alternate" hreflang="id" href="https://www.mikeudev.my.id/id/blog/post-slug" />
<link rel="alternate" hreflang="x-default" href="https://www.mikeudev.my.id/blog/post-slug" />
___BACKTICK______BACKTICK______BACKTICK___

Ini memberi tahu mesin pencari secara akurat bagaimana keselarasan terjemahan antar halaman berlangsung, memastikan pengguna menerima bahasa yang paling relevan dengan preferensi pencarian mereka.

---

## Kesimpulan

SEO bukan tentang mengakali algoritma pencarian; ini tentang menghadirkan kejelasan yang terstruktur bagi perayap web. Dengan menulis kerangka semantik yang bersih, menyediakan pratinjau media sosial yang optimal, menginjeksikan skema data profil, dan merincikan hubungan terjemahan, Anda menjamin portfolio Anda menonjol di hadapan mesin pencari dan calon klien.
		`.trim()
	},

	// --- Post 3: Accessibility ---
	{
		slug: 'web-accessibility-importance',
		locale: 'en',
		title: 'Why Web Accessibility Matters More Than You Think',
		description:
			'Building inclusive websites is a fundamental moral and technical obligation. Learn how to implement keyboard routing, focus trapping, and ARIA landmarks.',
		date: '2026-05-24',
		published: true,
		thumbnailUrl:
			'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800&auto=format&fit=crop',
		tags: ['A11y', 'Accessibility', 'WebDev', 'Inclusion'],
		readingTime: 7,
		content: `
## Introduction

Web Accessibility (commonly abbreviated as **A11y**) is the engineering practice of building websites that are usable by as many people as possible. This includes individuals with permanent visual impairment, hearing loss, cognitive challenges, motor disabilities, or even temporary limitations like a broken arm or a glare on a mobile screen in bright sunlight.

Far too often, developers treat accessibility as an afterthought or a tedious box to check at the end of a project. In reality, building accessible interfaces is a fundamental technical standard. Ignoring A11y not only isolates a large portion of your user base but also negatively impacts your SEO rankings and exposes your business to legal liability.

---

## 1. Semantic Elements vs Generic Divs

The absolute foundation of web accessibility is using native, semantic HTML elements. Native elements carry built-in browser behaviors, focus management, and predefined roles that are communicated directly to assistive technologies (such as screen readers).

A common antipattern is using generic ___BACKTICK___<div>___BACKTICK___ containers styled as buttons with custom Javascript click handlers:

___BACKTICK______BACKTICK______BACKTICK___html
<!-- ❌ UNACCESSIBLE ANTIPATTERN -->
<div class="custom-button" onclick={submitForm}>
	Submit
</div>
___BACKTICK______BACKTICK______BACKTICK___

This container is completely invisible to screen readers, cannot be selected using keyboard navigation, and lacks focus states.

Instead, always use native controls:

___BACKTICK______BACKTICK______BACKTICK___html
<!-- ✅ ACCESSIBLE BEST PRACTICE -->
<button type="button" class="btn-brutalist" onclick={submitForm}>
	Submit
</button>
___BACKTICK______BACKTICK______BACKTICK___

---

## 2. Keyboard Navigation and Focus Management

Many users rely exclusively on a keyboard (using the ___BACKTICK___Tab___BACKTICK___ and ___BACKTICK___Shift+Tab___BACKTICK___ keys) or specialized switch devices to navigate the web. To support this:

1. **Keep Focus States Visible:** Never set ___BACKTICK___outline: none___BACKTICK___ in your global CSS. Instead, style distinct, high-contrast focus rings using ___BACKTICK___:focus-visible___BACKTICK___.
2. **Support Logical DOM Order:** The tab flow must match the visual hierarchy of the page. Do not use CSS positioning hacks to shuffle components out of order.
3. **Use Skip Links:** Provide a hidden "Skip to main content" link at the top of your layout to allow keyboard users to easily bypass repetitive navigation menus.

___BACKTICK______BACKTICK______BACKTICK___css
/* Brutalist visible focus style example */
button:focus-visible,
a:focus-visible {
	outline: 3px solid var(--primary);
	outline-offset: 4px;
	box-shadow: 0 0 0 6px var(--background), 0 0 0 9px var(--foreground);
}
___BACKTICK______BACKTICK______BACKTICK___

---

## 3. Building an Accessible Modal Dialog in Svelte 5

Creating interactive elements like modal popups or dropdown drawers is where accessibility often breaks down. An accessible modal must trap the focus within its active viewport, close immediately upon pressing the ___BACKTICK___Escape___BACKTICK___ key, restore the focus back to the opening trigger button on close, and declare the appropriate ARIA roles.

Here is a Svelte 5 accessible modal component implementation:

___BACKTICK______BACKTICK______BACKTICK___svelte
<script lang="ts">
	import { onMount } from 'svelte';
	let { isOpen = $bindable(false), title, children } = $props<{
		isOpen: boolean;
		title: string;
		children?: import('svelte').Snippet;
	}>();

	let previousFocus: HTMLElement | null = null;
	let dialogRef = $state<HTMLDialogElement | null>(null);

	$effect(() => {
		if (isOpen) {
			previousFocus = document.activeElement as HTMLElement;
			dialogRef?.showModal();
		} else {
			dialogRef?.close();
			previousFocus?.focus();
		}
	});

	function handleClose() {
		isOpen = false;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleClose();
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialogRef}
	onclose={handleClose}
	onkeydown={handleKeyDown}
	aria-labelledby="modal-title"
	class="modal-brutalist"
>
	<div class="modal-header">
		<h2 id="modal-title">{title}</h2>
		<button onclick={handleClose} aria-label="Close modal">✕</button>
	</div>
	<div class="modal-body">
		{@render children?.()}
	</div>
</dialog>

<style>
	.modal-brutalist {
		border: 4px solid var(--foreground);
		padding: 24px;
		background: var(--background);
		box-shadow: 12px 12px 0 var(--foreground);
		max-width: 500px;
		width: 90%;
	}
	.modal-brutalist::backdrop {
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
	}
</style>
___BACKTICK______BACKTICK______BACKTICK___

---

## 4. Accessibility Compliance Checklist

To ensure your web applications comply with **WCAG 2.2 Level AA** standards:

| Focus Area | Requirement | Verification Method |
| :--- | :--- | :--- |
| **Color Contrast** | High contrast ratio of at least 4.5:1 for normal text and 3:1 for large headers. | Inspect elements using Chrome DevTools Accessibility pane. |
| **Text Alternatives** | Descriptive ___BACKTICK___alt___BACKTICK___ text on all content-rich images; empty ___BACKTICK___alt=""___BACKTICK___ for purely decorative assets. | Screen reader emulation tools. |
| **Form Inputs** | Explicit label pairing utilizing ___BACKTICK___for___BACKTICK___ and ___BACKTICK___id___BACKTICK___ attributes. | VoiceOver or NVDA testing. |
| **ARIA landmarks** | Explicit mapping of structural parts (___MAIN_LANDMARK___). | Page structure validator. |

---

## Conclusion

Web accessibility is a core measure of software quality. By establishing a solid semantic structural base, managing focus rings carefully, and wrapping custom interactive workflows inside accessible ARIA patterns, you create a vastly superior experience that welcomes every user and elevates your site's professional value.
		`.trim()
	},
	{
		slug: 'web-accessibility-importance',
		locale: 'id',
		title: 'Mengapa Aksesibilitas Web Lebih Penting dari yang Anda Kira',
		description:
			'Membangun situs web inklusif adalah kewajiban moral dan teknis yang mendasar. Pelajari cara menerapkan navigasi keyboard, trapping fokus, dan penanda ARIA.',
		date: '2026-05-24',
		published: true,
		thumbnailUrl:
			'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800&auto=format&fit=crop',
		tags: ['A11y', 'Aksesibilitas', 'WebDev', 'Inklusi'],
		readingTime: 7,
		content: `
## Pendahuluan

Aksesibilitas Web (biasa disingkat sebagai **A11y**) adalah praktik rekayasa perangkat lunak untuk membangun situs web agar dapat digunakan oleh sebanyak mungkin orang. Praktik ini ditujukan bagi penyandang disabilitas penglihatan permanen, kehilangan pendengaran, gangguan kognitif, hambatan motorik, maupun batasan sementara seperti seseorang yang tangannya sedang cedera, hingga keterbatasan situasional seperti layar ponsel yang silau di bawah terik matahari.

Sering kali pengembang memperlakukan aksesibilitas sebagai fitur sekunder atau daftar centang yang membosankan di akhir proyek. Pada kenyataannya, membangun antarmuka yang aksesibel adalah standar teknis yang mendasar. Mengabaikan A11y tidak hanya mengisolasi sebagian besar basis pengguna Anda, tetapi juga berdampak buruk pada peringkat SEO dan menghadapkan bisnis Anda pada risiko hukum.

---

## 1. Elemen Semantik vs Div Generik

Fondasi mutlak dari aksesibilitas web adalah penggunaan elemen semantik bawaan HTML. Elemen bawaan memiliki perilaku browser yang sudah terintegrasi, manajemen fokus otomatis, dan peran (*role*) terdefinisi yang dikomunikasikan secara langsung ke teknologi asisten (seperti pembaca layar / *screen readers*).

Kebiasaan buruk yang sering ditemui adalah menggunakan kontainer ___BACKTICK___<div>___BACKTICK___ generik yang dihias sebagai tombol dengan penanganan fungsi klik khusus JavaScript:

___BACKTICK______BACKTICK______BACKTICK___html
<!-- ❌ ANTIPATTERN TIDAK AKSESIBEL -->
<div class="custom-button" onclick={submitForm}>
	Kirim Data
</div>
___BACKTICK______BACKTICK______BACKTICK___

Kontainer ini sama sekali tidak terdeteksi oleh pembaca layar, tidak dapat dipilih menggunakan navigasi keyboard, dan tidak memiliki fokus indikator.

Sebagai gantinya, gunakan tombol bawaan browser:

___BACKTICK______BACKTICK______BACKTICK___html
<!-- ✅ PRAKTIK TERBAIK YANG AKSESIBEL -->
<button type="button" class="btn-brutalist" onclick={submitForm}>
	Kirim Data
</button>
___BACKTICK______BACKTICK______BACKTICK___

---

## 2. Navigasi Keyboard dan Manajemen Fokus

Banyak pengguna bernavigasi menggunakan keyboard (dengan tombol ___BACKTICK___Tab___BACKTICK___ dan ___BACKTICK___Shift+Tab___BACKTICK___) atau perangkat sakelar khusus. Untuk mendukung kebutuhan ini:

1. **Jaga Fokus Indikator Tetap Terlihat:** Jangan pernah menyetel ___BACKTICK___outline: none___BACKTICK___ pada CSS global Anda. Sebaliknya, buatlah cincin fokus berukuran tebal dan kontras tinggi menggunakan selektor ___BACKTICK___:focus-visible___BACKTICK___.
2. **Urutan DOM yang Logis:** Aliran penekanan tombol tab harus selaras dengan hierarki visual halaman. Jangan gunakan trik posisi CSS untuk mengacak urutan urutan tampilan komponen.
3. **Sediakan Skip Links:** Sediakan tautan "Lewati ke konten utama" yang tersembunyi di bagian atas tata letak untuk memudahkan pengguna keyboard melewati menu navigasi yang berulang.

___BACKTICK______BACKTICK______BACKTICK___css
/* Contoh gaya fokus brutalist yang terlihat */
button:focus-visible,
a:focus-visible {
	outline: 3px solid var(--primary);
	outline-offset: 4px;
	box-shadow: 0 0 0 6px var(--background), 0 0 0 9px var(--foreground);
}
___BACKTICK______BACKTICK______BACKTICK___

---

## 3. Membangun Dialog Modal yang Aksesibel di Svelte 5

Membangun antarmuka interaktif seperti jendela pop-up modal adalah bagian di mana aksesibilitas sering kali gagal diimplementasikan. Modal yang aksesibel wajib mengurung fokus keyboard (*focus trapping*) di dalam tampilan modal aktif, menutup secara instan saat pengguna menekan tombol ___BACKTICK___Escape___BACKTICK___ key, mengembalikan fokus kembali ke pemicu awal sebelum modal terbuka, dan mendeklarasikan peran ARIA dengan tepat.

Berikut contoh implementasi komponen modal yang aksesibel di Svelte 5:

___BACKTICK______BACKTICK______BACKTICK___svelte
<script lang="ts">
	import { onMount } from 'svelte';
	let { isOpen = $bindable(false), title, children } = $props<{
		isOpen: boolean;
		title: string;
		children?: import('svelte').Snippet;
	}>();

	let previousFocus: HTMLElement | null = null;
	let dialogRef = $state<HTMLDialogElement | null>(null);

	$effect(() => {
		if (isOpen) {
			previousFocus = document.activeElement as HTMLElement;
			dialogRef?.showModal();
		} else {
			dialogRef?.close();
			previousFocus?.focus();
		}
	});

	function handleClose() {
		isOpen = false;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleClose();
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialogRef}
	onclose={handleClose}
	onkeydown={handleKeyDown}
	aria-labelledby="modal-title"
	class="modal-brutalist"
>
	<div class="modal-header">
		<h2 id="modal-title">{title}</h2>
		<button onclick={handleClose} aria-label="Tutup modal">✕</button>
	</div>
	<div class="modal-body">
		{@render children?.()}
	</div>
</dialog>

<style>
	.modal-brutalist {
		border: 4px solid var(--foreground);
		padding: 24px;
		background: var(--background);
		box-shadow: 12px 12px 0 var(--foreground);
		max-width: 500px;
		width: 90%;
	}
	.modal-brutalist::backdrop {
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
	}
</style>
___BACKTICK______BACKTICK______BACKTICK___

---

## 4. Daftar Periksa Kepatuhan Aksesibilitas

Untuk memastikan aplikasi web Anda mematuhi standar **WCAG 2.2 Level AA**:

| Area Fokus | Persyaratan | Metode Verifikasi |
| :--- | :--- | :--- |
| **Kontras Warna** | Rasio kontras teks minimal 4.5:1 untuk teks normal dan 3:1 untuk header besar. | Periksa elemen menggunakan panel Aksesibilitas di Chrome DevTools. |
| **Teks Alternatif** | Berikan deskripsi ___BACKTICK___alt___BACKTICK___ pada semua gambar penting; gunakan ___BACKTICK___alt=""___BACKTICK___ untuk aset dekoratif. | Uji menggunakan emulator pembaca layar. |
| **Formulir Input** | Hubungkan kolom input dengan label secara eksplisit menggunakan atribut ___BACKTICK___for___BACKTICK___ dan ___BACKTICK___id___BACKTICK___. | Pengujian suara menggunakan VoiceOver atau NVDA. |
| **Penanda ARIA** | Pemetaan terstruktur yang jelas menggunakan tag (___MAIN_LANDMARK___). | Validator struktur halaman web. |

---

## Kesimpulan

Aksesibilitas web adalah indikator utama kualitas dari sebuah produk perangkat lunak. Dengan menetapkan fondasi elemen semantik yang solid, mengelola fokus indikator secara teliti, serta membungkus interaksi kustom di dalam pola ARIA yang aksesibel, Anda menyajikan pengalaman digital terbaik yang menyambut semua orang sekaligus meningkatkan nilai profesional situs Anda.
		`.trim()
	},

	// --- Post 4: Svelte 5 Runes ---
	{
		slug: 'svelte-5-runes-overview',
		locale: 'en',
		title: 'Understanding Svelte 5 Runes: The Future of Reactivity',
		description:
			"A comprehensive deep dive into Svelte 5's revolutionary new Runes system. Learn how it simplifies state management, improves compilation efficiency, and eliminates legacy reactive declaration quirks.",
		date: '2026-05-23',
		published: true,
		thumbnailUrl:
			'https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=800&auto=format&fit=crop',
		tags: ['Svelte', 'Runes', 'Frontend', 'WebDev'],
		readingTime: 9,
		content: `
## Introduction

For years, Svelte stood out in the frontend landscape by introducing compiler-driven reactivity. Unlike React or Vue, Svelte 3 and 4 did not rely on complex virtual DOM trees or elaborate observer classes at runtime. Instead, the Svelte compiler compiled reactive statements directly to simple, raw DOM updates.

While Svelte 4's reactive syntax—such as the let-based declarations and the \\\`$:\\\` reactive statements—worked incredibly well for simple components, it introduced architectural bottlenecks in complex, larger applications. Reactivity was bound tightly to component boundaries, making global state management challenging and leading to compiler ambiguities.

Svelte 5 changes the paradigm entirely by introducing **Runes**. Runes are a set of explicit, compiler-understood primitives that bring granular, signal-based reactivity directly into the language.

---

## 1. The Core Trio of Runes

At the heart of Svelte 5 are three core runes: \\\`$state()\\\`, \\\`$derived()\\\`, and \\\`$effect()\\\`. These replace Svelte 4's \\\`let\\\`, \\\`$:\\\` legacy reactive declarations, and lifecycle functions (like \\\`onMount\\\`).

### $state()
The \\\`$state()\\\` rune declares a reactive state variable. Under the hood, Svelte converts this variable into a signal, ensuring that changes to this variable trigger targeted updates in the DOM.

___BACKTICK______BACKTICK______BACKTICK___svelte
<!-- Svelte 5 Reactivity -->
<script lang="ts">
	let count = $state(0);
</script>

<button onclick={() => count++}>
	Clicks: {count}
</button>
___BACKTICK______BACKTICK______BACKTICK___

### $derived()
The \\\`$derived()\\\` rune defines computed values that automatically recalculate when their underlying state dependencies change. This replaces the old \\\`$:\\\` reactive declarations.

___BACKTICK______BACKTICK______BACKTICK___svelte
<script lang="ts">
	let count = $state(0);
	let double = $derived(count * 2);
</script>

<p>Double Value: {double}</p>
___BACKTICK______BACKTICK______BACKTICK___

### $effect()
The \\\`$effect()\\\` rune manages side-effects. It tracks any reactive variables referenced inside its body and re-runs the logic automatically whenever those variables change. It handles both setup and cleanup, effectively replacing \\\`onMount\\\`, \\\`onDestroy\\\`, and \\\`afterUpdate\\\`.

___BACKTICK______BACKTICK______BACKTICK___svelte
<script lang="ts">
	let count = $state(0);

	$effect(() => {
		console.log(\`Count changed to: \${count}\`);
		
		// Optional cleanup function
		return () => {
			console.log('Cleanup executed before the next run or destruction');
		};
	});
</script>
___BACKTICK______BACKTICK______BACKTICK___

---

## 2. Svelte 4 vs Svelte 5 Reactivity Comparison

Understanding the structural shift highlights how much cleaner and more predictable Svelte 5 is:

| Technical Task | Svelte 4 Legacy Syntax | Svelte 5 Runes Paradigm |
| :--- | :--- | :--- |
| **Declaring State** | \\\`let count = 0;\\\` | \\\`let count = $state(0);\\\` |
| **Derived Computations** | \\\`$: double = count * 2;\\\` | \\\`let double = $derived(count * 2);\\\` |
| **Side Effects** | \\\`onMount(() => { ... });\\\` | \\\`$effect(() => { ... });\\\` |
| **Exposing Component Props** | \\\`export let title;\\\` | \\\`let { title } = $props();\\\` |
| **Two-way Bindings** | \\\`export let value;\\\` | \\\`let { value = $bindable() } = $props();\\\` |

---

## 3. Global and Encapsulated State using Classes

In Svelte 4, sharing reactive logic outside of component files required utilizing Svelte Stores (___WRITABLE_STORES___). Svelte 5 completely eliminates this need. Because Runes operate independently of component file definitions, you can wrap reactive states inside standard TypeScript classes.

Here is an encapsulated global Counter state:

___BACKTICK______BACKTICK______BACKTICK___typescript
// src/lib/stores/counter.svelte.ts
export class CounterStore {
	#count = $state(0);

	get count() {
		return this.#count;
	}

	increment() {
		this.#count++;
	}

	decrement() {
		this.#count--;
	}
}

// Instantiate as a global singleton or component context
export const globalCounter = new CounterStore();
___BACKTICK______BACKTICK______BACKTICK___

Any Svelte component can import and use this class directly, and the UI will stay perfectly reactive:

___BACKTICK______BACKTICK______BACKTICK___svelte
<script lang="ts">
	import { globalCounter } from '$lib/stores/counter.svelte';
</script>

<button onclick={() => globalCounter.increment()}>
	Global Count: {globalCounter.count}
</button>
___BACKTICK______BACKTICK______BACKTICK___

---

## 4. Avoiding $effect Abuses

While \\\`$effect()\\\` is incredibly convenient, developers must be careful not to abuse it. A common antipattern is utilizing \\\`$effect()\\\` to compute local states:

___BACKTICK______BACKTICK______BACKTICK___typescript
// ❌ WRONG: Do not use $effect for calculations
let count = $state(0);
let double = $state(0);

$effect(() => {
	double = count * 2;
});
___BACKTICK______BACKTICK______BACKTICK___

This pattern triggers unnecessary rendering frames. Instead, always use \\\`$derived()\\\` for values derived from other states:

___BACKTICK______BACKTICK______BACKTICK___typescript
// ✅ CORRECT: Clean, synchronous derived state
let count = $state(0);
let double = $derived(count * 2);
___BACKTICK______BACKTICK______BACKTICK___

---

## Conclusion

Svelte 5 Runes bring Svelte into a new era of developer experience. By replacing compile-time reactive quirks with explicit signals, Runes bring consistency, scalability, and robust performance to your codebase.
		`.trim()
	},
	{
		slug: 'svelte-5-runes-overview',
		locale: 'id',
		title: 'Mengenal Rune di Svelte 5: Masa Depan Reaktivitas',
		description:
			'Analisis mendalam tentang sistem Rune baru di Svelte 5. Pelajari cara menyederhanakan pengelolaan state, meningkatkan efisiensi kompilasi, dan menghilangkan kebiasaan buruk deklarasi reaktif lama.',
		date: '2026-05-23',
		published: true,
		thumbnailUrl:
			'https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=800&auto=format&fit=crop',
		tags: ['Svelte', 'Runes', 'Frontend', 'WebDev'],
		readingTime: 9,
		content: `
## Pendahuluan

Selama bertahun-tahun, Svelte menonjol dalam jajaran kerangka kerja (*framework*) frontend karena memperkenalkan reaktivitas berbasis kompilasi (*compiler-driven*). Berbeda dengan React atau Vue, Svelte 3 dan 4 tidak bergantung pada pohon virtual DOM yang kompleks atau kelas observer yang rumit saat aplikasi berjalan. Sebaliknya, kompiler Svelte menerjemahkan deklarasi reaktif langsung ke pembaruan DOM mentah yang sangat efisien.

Meskipun sintaks reaktif Svelte 4—seperti penggunaan variabel \\\`let\\\` lokal dan pernyataan reaktif \\\`$:\\\`—berfungsi dengan sangat baik untuk komponen sederhana, hal tersebut memicu keterbatasan arsitektur pada aplikasi berskala besar. Reaktivitas terikat erat pada batas komponen saja, membuat pengelolaan state global menjadi menantang dan memicu ambiguitas kompiler.

Svelte 5 merombak paradigma tersebut dengan memperkenalkan **Runes**. Rune adalah sekumpulan fungsi primitif eksplisit yang dikenali langsung oleh kompiler untuk menghadirkan reaktivitas berbasis sinyal (*signal-based reactivity*) yang sangat fleksibel.

---

## 1. Tiga Rune Inti

Jantung dari Svelte 5 terletak pada tiga rune utama: \\\`$state()\\\`, \\\`$derived()\\\`, dan \\\`$effect()\\\`. Elemen-elemen ini menggantikan peran variabel \\\`let\\\`, deklarasi \\\`$:\\\` yang lama, dan fungsi daur hidup (*lifecycle functions*) di Svelte 4 (seperti \\\`onMount\\\`).

### $state()
Rune \\\`$state()\\\` mendeklarasikan variabel reaktif. Svelte mengubah variabel ini menjadi sinyal, memastikan perubahan data memicu pembaruan tepat sasaran di DOM.

___BACKTICK______BACKTICK______BACKTICK___svelte
<!-- Reaktivitas di Svelte 5 -->
<script lang="ts">
	let count = $state(0);
</script>

<button onclick={() => count++}>
	Klik: {count}
</button>
___BACKTICK______BACKTICK______BACKTICK___

### $derived()
Rune \\\`$derived()\\\` mendefinisikan nilai terhitung yang otomatis memperbarui dirinya ketika variabel state reaktif yang mendasarinya berubah. Ini menggantikan peran deklarasi reaktif \\\`$:\\\` yang lama.

___BACKTICK______BACKTICK______BACKTICK___svelte
<script lang="ts">
	let count = $state(0);
	let double = $derived(count * 2);
</script>

<p>Nilai Ganda: {double}</p>
___BACKTICK______BACKTICK______BACKTICK___

### $effect()
Rune \\\`$effect()\\\` menangani proses efek samping (*side-effects*). Rune ini melacak semua variabel reaktif di dalamnya dan otomatis menjalankan kembali logika saat nilai variabel tersebut berubah. Fungsi ini menggantikan peran \\\`onMount\\\`, \\\`onDestroy\\\`, dan \\\`afterUpdate\\\`.

___BACKTICK______BACKTICK______BACKTICK___svelte
<script lang="ts">
	let count = $state(0);

	$effect(() => {
		console.log(\`Nilai count berubah menjadi: \${count}\`);
		
		// Fungsi pembersihan opsional (cleanup)
		return () => {
			console.log('Cleanup dijalankan sebelum daur hidup berikutnya atau penghancuran komponen');
		};
	});
</script>
___BACKTICK______BACKTICK______BACKTICK___

---

## 2. Perbandingan Teknis Svelte 4 vs Svelte 5

Memahami pergeseran struktur ini memperlihatkan betapa bersih dan prediktabilnya Svelte 5:

| Tugas Teknis | Sintaks Lama Svelte 4 | Paradigma Rune Svelte 5 |
| :--- | :--- | :--- |
| **Mendeklarasikan State** | \\\`let count = 0;\\\` | \\\`let count = $state(0);\\\` |
| **Kalkulasi Terhitung** | \\\`$: double = count * 2;\\\` | \\\`let double = $derived(count * 2);\\\` |
| **Efek Samping (Side Effects)** | \\\`onMount(() => { ... });\\\` | \\\`$effect(() => { ... });\\\` |
| **Menerima Properti / Props** | \\\`export let title;\\\` | \\\`let { title } = $props();\\\` |
| **Pengikatan Data Dua Arah** | \\\`export let value;\\\` | \\\`let { value = $bindable() } = $props();\\\` |

---

## 3. State Global Menggunakan Kelas TypeScript

Pada Svelte 4, berbagi logika reaktif di luar berkas komponen mengharuskan penggunaan Svelte Stores (___WRITABLE_STORES___). Svelte 5 menghilangkan batasan tersebut. Karena Rune dapat bekerja di luar berkas komponen, Anda dapat merangkum variabel state reaktif di dalam kelas TypeScript biasa.

Berikut contoh enkapsulasi state Counter global:

___BACKTICK______BACKTICK______BACKTICK___typescript
// src/lib/stores/counter.svelte.ts
export class CounterStore {
	#count = $state(0);

	get count() {
		return this.#count;
	}

	increment() {
		this.#count++;
	}

	decrement() {
		this.#count--;
	}
}

// Instansiasi sebagai singleton global
export const globalCounter = new CounterStore();
___BACKTICK______BACKTICK______BACKTICK___

Setiap komponen Svelte dapat mengimpor dan menggunakan objek kelas ini secara langsung, dan UI akan tetap reaktif dengan sempurna:

___BACKTICK______BACKTICK______BACKTICK___svelte
<script lang="ts">
	import { globalCounter } from '$lib/stores/counter.svelte';
</script>

<button onclick={() => globalCounter.increment()}>
	Jumlah Global: {globalCounter.count}
</button>
___BACKTICK______BACKTICK______BACKTICK___

---

## 4. Menghindari Penyalahgunaan $effect

Meskipun \\\`$effect()\\\` sangat praktis, hindari penggunaannya untuk menghitung data lokal karena dapat memicu render berulang:

___BACKTICK______BACKTICK______BACKTICK___typescript
// ❌ SALAH: Jangan gunakan $effect untuk kalkulasi lokal
let count = $state(0);
let double = $state(0);

$effect(() => {
	double = count * 2;
});
___BACKTICK______BACKTICK______BACKTICK___

Ini adalah anti-pola yang memboroskan siklus rendering. Sebagai gantinya, gunakan selalu \\\`$derived()\\\` untuk perhitungan sinkron:

___BACKTICK______BACKTICK______BACKTICK___typescript
// ✅ BENAR: Perhitungan sinkron terhitung yang bersih
let count = $state(0);
let double = $derived(count * 2);
___BACKTICK______BACKTICK______BACKTICK___

---

## Kesimpulan

Rune di Svelte 5 membawa era baru bagi kenyamanan pengembang. Dengan menggantikan kebiasaan kompilasi lama menggunakan sinyal eksplisit, Rune menghadirkan konsistensi, skalabilitas, dan performa luar biasa dalam kode aplikasi Anda.
		`.trim()
	},

	// --- Post 5: Paraglide ---
	{
		slug: 'building-bilingual-paraglide',
		locale: 'en',
		title: 'Bilingual Made Easy: Building with Paraglide-js',
		description:
			'How to implement typesafe, compile-time internationalization (i18n) in SvelteKit using Paraglide-js. Minimize bundle sizes and avoid rendering flashes.',
		date: '2026-05-22',
		published: true,
		thumbnailUrl:
			'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
		tags: ['I18n', 'Paraglide', 'Global', 'SvelteKit'],
		readingTime: 6,
		content: `
## Introduction

Providing multi-language support (Internationalization or **i18n**) is a crucial step to expanding your website's reach and providing a premium user experience to localized audiences. However, setting up i18n in modern fullstack frameworks has traditionally been a painful process.

Many popular i18n libraries rely on runtime dictionary loading. This often leads to performance issues, such as page rendering flashes (where text shifts from English to the target language on load) and bloated Javascript bundles containing large JSON dictionaries.

**Paraglide-JS** (developed by the Inlang team) changes the paradigm completely by handling internationalization at compile-time. Paraglide generates lean, type-safe translation helper functions that ensure zero runtime overhead and perfect SvelteKit server-side rendering support.

---

## 1. Compile-Time i18n Architecture

Unlike traditional libraries that load massive JSON key-value bundles over the network, Paraglide compiles your translation messages directly into small, tree-shakeable JavaScript functions.

If a Svelte component needs a translation string, instead of invoking a generic lookup method like \\\`$t('home.welcome')\\\`, you invoke an explicit generated function:

___BACKTICK______BACKTICK______BACKTICK___typescript
import * as m from '$lib/paraglide/messages';

// Fully type-safe compile-time translation call
console.log(m.welcome_message({ name: 'Mikeu' }));
___BACKTICK______BACKTICK______BACKTICK___

This guarantees:
1. **Perfect Type Safety:** If a translation key is missing or has incorrect arguments, Svelte check will throw a compile-time error.
2. **Optimal Code Splitting:** Only the translation messages used by the active page are bundled into the client build.
3. **No Layout Shift:** Since the translations are compiled directly into the rendering code, the SvelteKit server outputs the correct language HTML immediately.

---

## 2. Setting Up Message Files

In a Paraglide setup, translations are structured in localized JSON directories (typically under a \\\`messages/\\\` folder). 

Here is an example structure:

___BACKTICK______BACKTICK______BACKTICK___json
// messages/en.json
{
	"$schema": "https://inlang.com/schema/inlang-message-format",
	"home_hero_title": "Crafting Brutalist Digital Systems.",
	"home_hero_sub": "Hi, I am {name}, a software engineer focused on extreme performance."
}
___BACKTICK______BACKTICK______BACKTICK___

___BACKTICK______BACKTICK______BACKTICK___json
// messages/id.json
{
	"$schema": "https://inlang.com/schema/inlang-message-format",
	"home_hero_title": "Membangun Sistem Digital Brutalist.",
	"home_hero_sub": "Halo, saya {name}, seorang software engineer dengan fokus performa ekstrem."
}
___BACKTICK______BACKTICK______BACKTICK___

During the build process, Paraglide reads these files and compiles them into a highly optimized module at \\\`src/lib/paraglide/\\\`.

---

## 3. Utilizing Translations inside Svelte 5 Components

Using Paraglide translations inside Svelte 5 components is extremely simple. Once the translation files are defined, you can import and execute the compiler-generated functions directly:

___BACKTICK______BACKTICK______BACKTICK___svelte
<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	let userName = $state('Riki');
</script>

<section class="hero-brutalist">
	<h1>{m.home_hero_title()}</h1>
	<p>{m.home_hero_sub({ name: userName })}</p>
</section>

<style>
	.hero-brutalist {
		border: 4px solid var(--foreground);
		padding: 40px;
		background: var(--background);
	}
</style>
___BACKTICK______BACKTICK______BACKTICK___

---

## 4. Implementing a Language Switcher in SvelteKit

To allow users to switch languages on the fly, you must implement a language toggle that safely routes the user to the correct localized pathname. Paraglide provides runtime utilities like \\\`localizeHref\\\` to translate URLs.

Here is a Svelte 5 Navbar language switcher component:

___BACKTICK______BACKTICK______BACKTICK___svelte
<script lang="ts">
	import { page } from '$app/state';
	import { locales, localizeHref, baseLocale } from '$lib/paraglide/runtime';
	import { goto } from '$app/navigation';

	// Retrieve active locale from Paraglide context
	let activeLocale = $derived(page.url.pathname.startsWith('/id') ? 'id' : 'en');

	function switchLanguage(locale: string) {
		const targetUrl = localizeHref(page.url.pathname, { locale });
		goto(targetUrl);
	}
</script>

<div class="lang-switcher">
	{#each locales as locale}
		<button
			onclick={() => switchLanguage(locale)}
			class="lang-btn {activeLocale === locale ? 'active' : ''}"
		>
			{locale === 'en' ? '🇬🇧 EN' : '🇮🇩 ID'}
		</button>
	{/each}
</div>

<style>
	.lang-switcher {
		display: flex;
		gap: 8px;
		border: 2px solid var(--foreground);
		padding: 4px;
		background: var(--background);
	}
	.lang-btn {
		font-family: monospace;
		font-weight: bold;
		padding: 4px 8px;
		border: none;
		background: transparent;
		cursor: pointer;
		text-transform: uppercase;
	}
	.lang-btn.active {
		background: var(--foreground);
		color: var(--background);
	}
</style>
___BACKTICK______BACKTICK______BACKTICK___

---

## Conclusion

Paraglide-js establishes a brand new standard for internationalization. By merging compile-time build steps with SvelteKit's native routing, it allows developers to deploy rich, bilingual web applications that stay lightweight and incredibly fast.
		`.trim()
	},
	{
		slug: 'building-bilingual-paraglide',
		locale: 'id',
		title: 'Memperkenalkan Paraglide-js: Membangun Situs Bilingual dengan Mudah',
		description:
			'Cara menerapkan internasionalisasi (i18n) yang aman (typesafe) pada level kompilasi di SvelteKit menggunakan Paraglide-js. Meminimalkan ukuran bundle berkas JavaScript dan mencegah visual berkedip saat memuat halaman.',
		date: '2026-05-22',
		published: true,
		thumbnailUrl:
			'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
		tags: ['I18n', 'Paraglide', 'Global', 'SvelteKit'],
		readingTime: 6,
		content: `
## Pendahuluan

Menyediakan dukungan multi-bahasa (Internasionalisasi atau **i18n**) adalah langkah krusial untuk memperluas jangkauan situs web Anda dan memberikan pengalaman pengguna premium bagi audiens lokal. Namun, menyetel i18n dalam kerangka kerja (*framework*) modern sering kali merupakan proses yang rumit.

Banyak pustaka i18n populer bergantung pada pemuatan kamus terjemahan saat aplikasi berjalan (*runtime dictionary loading*). Hal ini kerap memicu masalah performa, seperti teks berkedip saat memuat halaman (di mana teks berubah dari bahasa Inggris ke bahasa tujuan setelah pemuatan selesai) serta membengkaknya bundle JavaScript akibat menampung kamus JSON berukuran besar.

**Paraglide-JS** (dikembangkan oleh tim Inlang) merombak total paradigma tersebut dengan menangani internasionalisasi pada saat kompilasi (*compile-time*). Paraglide menghasilkan fungsi pembantu terjemahan yang ringkas dan aman tipe (*typesafe*), memastikan tidak ada penambahan beban kerja saat aplikasi berjalan (*zero runtime overhead*), serta mendukung server-side rendering SvelteKit dengan sempurna.

---

## 1. Arsitektur Kompilasi i18n

Berbeda dengan pustaka tradisional yang memuat seluruh berkas terjemahan JSON melalui jaringan internet, Paraglide menyusun pesan terjemahan Anda langsung ke dalam fungsi-fungsi JavaScript berukuran sangat kecil yang bersifat *tree-shakeable*.

Jika komponen Svelte membutuhkan teks terjemahan, Anda tidak perlu memanggil fungsi generik seperti \\\`$t('home.welcome')\\\`. Sebaliknya, panggil fungsi terjemahan yang dihasilkan secara eksplisit oleh kompiler:

___BACKTICK______BACKTICK______BACKTICK___typescript
import * as m from '$lib/paraglide/messages';

// Panggilan terjemahan yang sepenuhnya aman tipe (typesafe)
console.log(m.welcome_message({ name: 'Mikeu' }));
___BACKTICK______BACKTICK______BACKTICK___

Hal ini menjamin:
1. **Keamanan Tipe Mutlak:** Jika kunci terjemahan hilang atau argumen fungsi salah, proses build akan langsung memunculkan galat.
2. **Pemisahan Kode Maksimal:** Hanya pesan terjemahan yang digunakan oleh halaman aktif saja yang akan dimasukkan ke dalam berkas build klien.
3. **Bebas Pergeseran Tampilan:** Karena terjemahan disusun langsung pada kode tampilan, server SvelteKit menyajikan file HTML dalam bahasa yang benar secara instan sejak awal.

---

## 2. Struktur Berkas Kamus Terjemahan

Dalam konfigurasi Paraglide, terjemahan disusun di dalam direktori JSON terlokalisasi (biasanya di bawah folder \\\`messages/\\\`).

Berikut contoh strukturnya:

___BACKTICK______BACKTICK______BACKTICK___json
// messages/en.json
{
	"$schema": "https://inlang.com/schema/inlang-message-format",
	"home_hero_title": "Crafting Brutalist Digital Systems.",
	"home_hero_sub": "Hi, I am {name}, a software engineer focused on extreme performance."
}
___BACKTICK______BACKTICK______BACKTICK___

___BACKTICK______BACKTICK______BACKTICK___json
// messages/id.json
{
	"$schema": "https://inlang.com/schema/inlang-message-format",
	"home_hero_title": "Membangun Sistem Digital Brutalist.",
	"home_hero_sub": "Halo, saya {name}, seorang software engineer dengan fokus performa ekstrem."
}
___BACKTICK______BACKTICK______BACKTICK___

---

## 3. Menggunakan Terjemahan di Komponen Svelte 5

Menggunakan hasil kompilasi terjemahan Paraglide di dalam komponen Svelte 5 sangatlah mudah. Cukup impor dan jalankan fungsi terjemahan tersebut secara langsung:

___BACKTICK______BACKTICK______BACKTICK___svelte
<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	let userName = $state('Riki');
</script>

<section class="hero-brutalist">
	<h1>{m.home_hero_title()}</h1>
	<p>{m.home_hero_sub({ name: userName })}</p>
</section>

<style>
	.hero-brutalist {
		border: 4px solid var(--foreground);
		padding: 40px;
		background: var(--background);
	}
</style>
___BACKTICK______BACKTICK______BACKTICK___

---

## 4. Membangun Pengubah Bahasa di SvelteKit

Untuk memungkinkan pengguna beralih bahasa secara instan, Anda harus membuat tombol pemilih bahasa yang mengarahkan pengguna ke rute URL yang sesuai. Paraglide menyediakan utilitas \\\`localizeHref\\\` untuk menerjemahkan URL secara otomatis.

Berikut adalah contoh pemilih bahasa pada bilah navigasi menggunakan Svelte 5:

___BACKTICK______BACKTICK______BACKTICK___svelte
<script lang="ts">
	import { page } from '$app/state';
	import { locales, localizeHref, baseLocale } from '$lib/paraglide/runtime';
	import { goto } from '$app/navigation';

	// Ambil bahasa aktif dari jalur URL
	let activeLocale = $derived(page.url.pathname.startsWith('/id') ? 'id' : 'en');

	function switchLanguage(locale: string) {
		const targetUrl = localizeHref(page.url.pathname, { locale });
		goto(targetUrl);
	}
</script>

<div class="lang-switcher">
	{#each locales as locale}
		<button
			onclick={() => switchLanguage(locale)}
			class="lang-btn {activeLocale === locale ? 'active' : ''}"
		>
			{locale === 'en' ? '🇬🇧 EN' : '🇮🇩 ID'}
		</button>
	{/each}
</div>

<style>
	.lang-switcher {
		display: flex;
		gap: 8px;
		border: 2px solid var(--foreground);
		padding: 4px;
		background: var(--background);
	}
	.lang-btn {
		font-family: monospace;
		font-weight: bold;
		padding: 4px 8px;
		border: none;
		background: transparent;
		cursor: pointer;
		text-transform: uppercase;
	}
	.lang-btn.active {
		background: var(--foreground);
		color: var(--background);
	}
</style>
___BACKTICK______BACKTICK______BACKTICK___

---

## Kesimpulan

Paraglide-js menghadirkan standar kualitas tingkat tinggi bagi internasionalisasi aplikasi web. Dengan menggabungkan pemrosesan i18n pada tahap kompilasi bersama integrasi rute bawaan SvelteKit, Anda dapat meluncurkan produk aplikasi web bilingual yang sangat ringan dan berkinerja tinggi.
		`.trim()
	}
];

export async function seedBlogPosts() {
	if (!db) {
		console.warn('seedBlogPosts: Database not initialized.');
		return { success: false, message: 'Database not initialized' };
	}

	const results = [];
	const collection = db.collection(COLLECTIONS.BLOG_POSTS);

	for (const post of NEW_POSTS) {
		const id = `${post.slug}-${post.locale}`;

		try {
			// Overwrite existing to update fields (set() is fine)
			await collection.doc(id).set({
				...post,
				content: post.content.replace(/___BACKTICK___/g, '`'),
				updatedAt: new Date()
			});

			results.push({ id, status: 'success' });
		} catch (error: unknown) {
			results.push({ id, status: 'error', message: (error as Error).message });
		}
	}

	return {
		success: true,
		total: NEW_POSTS.length,
		results
	};
}

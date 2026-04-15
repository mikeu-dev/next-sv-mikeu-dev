import { db } from '$lib/server/firebase/firebase.server';
import { COLLECTIONS } from '$lib/server/firebase/collections';
import type { BlogPost } from '../blog.service';

const NEW_POSTS: Omit<BlogPost, 'id'>[] = [
	// --- Post 1: Performance ---
	{
		slug: 'mastering-sveltekit-performance',
		locale: 'en',
		title: 'Mastering SvelteKit Performance: A Professional Guide',
		description: 'Learn how to optimize your SvelteKit applications for lightning-fast load times and perfect Core Web Vitals.',
		date: '2026-04-15',
		published: true,
		content: `
## Why Performance Matters
In today's fast-paced digital world, users expect websites to load instantly. Performance is not just about speed; it's about user experience, SEO ranking, and conversion rates.

## Key Optimization Techniques

### 1. Smart Preloading
SvelteKit offers powerful preloading capabilities. Use the data-sveltekit-preload-data attribute on your links to fetch data as soon as a user hovers over a link.

### 2. Image Optimization
Never serve raw images. Use modern formats like WebP or Avif and ensure you're using responsive image techniques to serve the right size to the right device.

### 3. Progressive Enhancement
Build features that work without JavaScript first, then layer on interactivity. This ensures a baseline experience for all users and faster Time to Interactive (TTI).

## Conclusion
Performance optimization is an ongoing process. Regularly audit your site using tools like Lighthouse and PageSpeed Insights to stay ahead.
		`.trim()
	},
	{
		slug: 'mastering-sveltekit-performance',
		locale: 'id',
		title: 'Optimasi Performa SvelteKit: Panduan Profesional',
		description: 'Pelajari cara mengoptimalkan aplikasi SvelteKit Anda untuk waktu pemuatan yang kilat dan Core Web Vitals yang sempurna.',
		date: '2026-04-15',
		published: true,
		content: `
## Mengapa Performa Itu Penting
Di dunia digital yang serba cepat saat ini, pengguna mengharapkan situs web dimuat secara instan. Performa bukan hanya soal kecepatan; ini tentang pengalaman pengguna, peringkat SEO, dan tingkat konversi.

## Teknik Optimasi Utama

### 1. Preloading Cerdas
SvelteKit menawarkan kemampuan preloading yang kuat. Gunakan atribut data-sveltekit-preload-data pada tautan Anda untuk mengambil data segera setelah pengguna mengarahkan kursor ke tautan.

### 2. Optimasi Gambar
Jangan pernah mengirimkan gambar mentah. Gunakan format modern seperti WebP atau Avif dan pastikan Anda menggunakan teknik gambar responsif untuk memberikan ukuran yang tepat ke perangkat yang tepat.

### 3. Progressive Enhancement
Bangun fitur yang berfungsi tanpa JavaScript terlebih dahulu, kemudian tambahkan interaktivitas. Ini memastikan pengalaman dasar bagi semua pengguna dan Waktu Interaktif (TTI) yang lebih cepat.

## Kesimpulan
Optimasi performa adalah proses yang berkelanjutan. Lakukan audit situs Anda secara rutin menggunakan alat seperti Lighthouse dan PageSpeed Insights agar tetap unggul.
		`.trim()
	},

	// --- Post 2: SEO ---
	{
		slug: 'portfolio-seo-guide',
		locale: 'en',
		title: "The Developer's Guide to Portfolio SEO",
		description: 'How to make your developer portfolio stand out in search engines and attract recruiters.',
		date: '2026-04-14',
		published: true,
		content: `
## Introduction
Your portfolio is your digital resume. But it's only effective if people can find it. SEO (Search Engine Optimization) is key to increasing your visibility.

## Essential SEO Tips

### 1. Semantic HTML
Use the right tags for the right content. Use <article>, <section>, and proper heading hierarchies (<h1> through <h6>). This helps search engines understand your content structure.

### 2. Meta Tags & JSON-LD
Ensure every page has a unique title and meta description. Implementing JSON-LD (Structured Data) helps Google display your site as a "Rich Result."

### 3. Content is King
Write blog posts about your projects. This provides more entry points for search engines and demonstrates your expertise to potential employers.

## Summary
SEO for portfolios isn't about gaming the system; it's about making your value clear to both humans and machines.
		`.trim()
	},
	{
		slug: 'portfolio-seo-guide',
		locale: 'id',
		title: 'Panduan SEO Portfolio untuk Developer',
		description: 'Cara membuat portfolio developer Anda menonjol di mesin pencari dan menarik perhatian rekruter.',
		date: '2026-04-14',
		published: true,
		content: `
## Pendahuluan
Portfolio Anda adalah resume digital Anda. Namun, ini hanya efektif jika orang bisa menemukannya. SEO (Search Engine Optimization) adalah kunci untuk meningkatkan visibilitas Anda.

## Tips SEO Penting

### 1. HTML Semantik
Gunakan tag yang tepat untuk konten yang tepat. Gunakan <article>, <section>, dan hierarki heading yang benar (<h1> hingga <h6>). Ini membantu mesin pencari memahami struktur konten Anda.

### 2. Meta Tags & JSON-LD
Pastikan setiap halaman memiliki judul dan deskripsi meta yang unik. Mengimplementasikan JSON-LD (Structured Data) membantu Google menampilkan situs Anda sebagai "Rich Result."

### 3. Konten adalah Raja
Tulis postingan blog tentang proyek Anda. Ini memberikan lebih banyak pintu masuk bagi mesin pencari dan menunjukkan keahlian Anda kepada calon pemberi kerja.

## Ringkasan
SEO untuk portfolio bukan tentang mengakali sistem; ini tentang memperjelas nilai Anda bagi manusia maupun mesin.
		`.trim()
	},

	// --- Post 3: Accessibility ---
	{
		slug: 'web-accessibility-importance',
		locale: 'en',
		title: 'Why Web Accessibility Matters More Than You Think',
		description: 'Building inclusive websites is a moral and professional obligation. Here is how to start with A11y.',
		date: '2026-04-13',
		published: true,
		content: `
## Accessibility is for Everyone
Web Accessibility (A11y) is the practice of making your websites usable by as many people as possible, including those with visual, auditory, cognitive, or motor disabilities.

## Quick Wins for A11y

### 1. Alt Text for Images
Always provide descriptive alt attributes for images. If an image is purely decorative, use an empty alt="".

### 2. Color Contrast
Ensure your text has enough contrast against its background. Aim for a ratio of at least 4.5:1 for normal text.

### 3. Keyboard Navigation
Make sure your site is fully navigable using only the keyboard. Visible focus states are a must for accessibility.

## Final Thoughts
An accessible web is a better web for everyone. Start small, but start today.
		`.trim()
	},
	{
		slug: 'web-accessibility-importance',
		locale: 'id',
		title: 'Mengapa Aksesibilitas Web Lebih Penting dari yang Anda Kira',
		description: 'Membangun situs web inklusif adalah kewajiban moral dan profesional. Berikut cara memulai A11y.',
		date: '2026-04-13',
		published: true,
		content: `
## Aksesibilitas untuk Semua Orang
Aksesibilitas Web (A11y) adalah praktik membuat situs web Anda dapat digunakan oleh sebanyak mungkin orang, termasuk mereka yang memiliki gangguan penglihatan, pendengaran, kognitif, atau motorik.

## Langkah Cepat untuk A11y

### 1. Teks Alt untuk Gambar
Selalu berikan atribut alt yang deskriptif untuk gambar. Jika gambar murni dekoratif, gunakan alt="" yang kosong.

### 2. Kontras Warna
Pastikan teks Anda memiliki kontras yang cukup terhadap latar belakangnya. Targetkan rasio setidaknya 4,5:1 untuk teks normal.

### 3. Navigasi Keyboard
Pastikan situs Anda dapat dinavigasi sepenuhnya hanya menggunakan keyboard. State fokus yang terlihat adalah keharusan untuk aksesibilitas.

## Pemikiran Akhir
Web yang aksesibel adalah web yang lebih baik untuk semua orang. Mulai dari hal kecil, tapi mulailah hari ini.
		`.trim()
	},

	// --- Post 4: Svelte 5 Runes ---
	{
		slug: 'svelte-5-runes-overview',
		locale: 'en',
		title: 'Understanding Svelte 5 Runes: The Future of Reactivity',
		description: "A deep dive into Svelte 5's new runes system and how it simplifies state management.",
		date: '2026-04-12',
		published: true,
		content: `
## The Evolution of Svelte
Svelte 5 introduces "Runes," a set of primitives for building reactive applications. This change makes reactivity more explicit and easier to reason about in complex components.

## Essential Runes

### $state
The foundation of Svelte 5 reactivity. Use $state to declare reactive variables.

### $derived
Use this for values that depend on other reactive states. It replaces the old $: reactive declarations.

### $effect
The replacement for onMount and side-effects. It runs code when its dependencies change.

## Conclusion
Runes represent a significant step forward for the Svelte ecosystem, bringing more power and clarity to developers.
		`.trim()
	},
	{
		slug: 'svelte-5-runes-overview',
		locale: 'id',
		title: 'Mengenal Rune di Svelte 5: Masa Depan Reaktivitas',
		description: 'Analisis mendalam tentang sistem rune baru di Svelte 5 dan bagaimana cara menyederhanakan pengelolaan state.',
		date: '2026-04-12',
		published: true,
		content: `
## Evolusi Svelte
Svelte 5 memperkenalkan "Runes," sekumpulan primitif untuk membangun aplikasi reaktif. Perubahan ini membuat reaktivitas lebih eksplisit dan lebih mudah dipahami dalam komponen yang kompleks.

## Rune Penting

### $state
Fondasi reaktivitas Svelte 5. Gunakan $state untuk mendeklarasikan variabel reaktif.

### $derived
Gunakan ini untuk nilai yang bergantung pada state reaktif lainnya. Ini menggantikan deklarasi reaktif $: yang lama.

### $effect
Pengganti onMount dan side-effects. Ini menjalankan kode saat dependensinya berubah.

## Kesimpulan
Runes mewakili langkah maju yang signifikan bagi ekosistem Svelte, memberikan lebih banyak kekuatan dan kejelasan bagi pengembang.
		`.trim()
	},

	// --- Post 5: Paraglide ---
	{
		slug: 'building-bilingual-paraglide',
		locale: 'en',
		title: 'Bilingual Made Easy: Building with Paraglide-js',
		description: 'How to use Paraglide-js to build type-safe, performant multi-language sites in SvelteKit.',
		date: '2026-04-11',
		published: true,
		content: `
## Internationalization in SvelteKit
Building a site that supports multiple languages can be complex. Paraglide-js simplifies this process while maintaining excellent performance and type safety.

## Why Choose Paraglide?

### 1. Typesafe Messages
Paraglide generates TypeScript functions for every translation string, ensuring you never miss a translation.

### 2. No Framework Lock-in
While it works great with SvelteKit, Paraglide is framework-agnostic, making it a versatile tool for any project.

### 3. Performance
Paraglide is built with performance in mind, ensuring that your bilingual site stays fast and responsive.

## Getting Started
It's easy to integrate Paraglide into your SvelteKit projects. Start by defining your messages and let Paraglide handle the rest.
		`.trim()
	},
	{
		slug: 'building-bilingual-paraglide',
		locale: 'id',
		title: 'Memperkenalkan Paraglide-js: Membangun Situs Bilingual dengan Mudah',
		description: 'Cara menggunakan Paraglide-js untuk membangun situs multi-bahasa yang type-safe dan berperforma tinggi di SvelteKit.',
		date: '2026-04-11',
		published: true,
		content: `
## Internasionalisasi di SvelteKit
Membangun situs yang mendukung banyak bahasa bisa menjadi rumit. Paraglide-js menyederhanakan proses ini sambil mempertahankan performa yang sangat baik dan keamanan tipe (type safety).

## Mengapa Memilih Paraglide?

### 1. Pesan yang Aman Tipe (Typesafe)
Paraglide menghasilkan fungsi TypeScript untuk setiap string terjemahan, memastikan Anda tidak pernah melewatkan terjemahan.

### 2. Bebas Lock-in Framework
Meskipun bekerja sangat baik dengan SvelteKit, Paraglide tidak terbatas pada satu framework saja, menjadikannya alat yang serbaguna untuk proyek apa pun.

### 3. Performa
Paraglide dibangun dengan mempertimbangkan performa, memastikan bahwa situs bilingual Anda tetap cepat dan responsif.

## Memulai
Sangat mudah untuk mengintegrasikan Paraglide ke dalam proyek SvelteKit Anda. Mulailah dengan mendefinisikan pesan Anda dan biarkan Paraglide menangani sisanya.
		`.trim()
	}
];

export async function seedBlogPosts() {
	const results = [];
	const collection = db.collection(COLLECTIONS.BLOG_POSTS);

	for (const post of NEW_POSTS) {
		const id = `${post.slug}-${post.locale}`;
		
		try {
			// Check if already exists to avoid unnecessary writes, 
			// though set() is idempotent, this fits "anti-redundant" better
			const existing = await collection.doc(id).get();
			
			if (existing.exists) {
				results.push({ id, status: 'skipped (already exists)' });
				continue;
			}

			await collection.doc(id).set({
				...post,
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

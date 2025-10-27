<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.png';
	import { onMount } from 'svelte';
	import { Toaster } from 'svelte-sonner';
	import { ModeWatcher } from 'mode-watcher';
	import { auth } from '$lib/firebase/firebase.client';
	import { onAuthStateChanged } from 'firebase/auth';
	import Navbar from '@/lib/components/guest/navbar/navbar.svelte';
	import Footer from '@/lib/components/guest/footer/footer.svelte';
	import SEO from '@/lib/components/seo/seo.svelte';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { page } from '$app/state';

	let { data, children } = $props();

	let user;
	onMount(() => {
		const unsubscribe = onAuthStateChanged(auth, (newUser) => {
			user = newUser;
		});
		return unsubscribe;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<SEO />
<ModeWatcher />
<Toaster />
<div class="flex min-h-screen flex-col">
	<Navbar />

	<main class="container mx-auto px-4 py-8">
		{@render children?.()}
	</main>

	<Footer />
</div>
<div style="display:none">
	{#each locales as locale}
		<a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
	{/each}
</div>

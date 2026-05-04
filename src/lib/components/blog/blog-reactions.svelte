<script lang="ts">
	import { Heart, Eye } from '@lucide/svelte';
	import { page } from '$app/state';
	import { onMount, tick } from 'svelte';
	import { m } from '@/lib/paraglide/messages';
	import { ConfettiCannon } from 'svelte-canvas-confetti';

	let { reactions = { likes: 0, views: 0 } } = $props<{
		reactions: { likes: number; views: number };
	}>();

	let likes = $state(0);
	let views = $state(0);
	let hasLiked = $state(false);
	let isLoading = $state(false);
	let showConfetti = $state(false);

	// Sync with props
	$effect(() => {
		likes = reactions.likes;
		views = reactions.views;
	});

	onMount(() => {
		// Simple local storage to prevent multiple likes from same browser
		const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
		hasLiked = likedPosts.includes(page.params.slug);
	});

	async function handleLike() {
		console.log('HandleLike clicked', { hasLiked, isLoading, slug: page.params.slug });
		if (hasLiked || isLoading) return;

		isLoading = true;
		// Optimistic update
		likes += 1;
		hasLiked = true;

		// Confetti effect!
		showConfetti = false;
		await tick();
		showConfetti = true;

		try {
			console.log('Sending like request to:', `/api/blog/${page.params.slug}/like`);
			const res = await fetch(`/api/blog/${page.params.slug}/like`, {
				method: 'POST'
			});

			if (res.ok) {
				const data = await res.json();
				console.log('Like response:', data);
				likes = data.likes;

				// Save to local storage
				const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
				if (!likedPosts.includes(page.params.slug)) {
					likedPosts.push(page.params.slug);
					localStorage.setItem('liked_posts', JSON.stringify(likedPosts));
				}
			} else {
				const errData = await res.json();
				console.error('Like failed:', errData);
				// Rollback if failed
				likes -= 1;
				hasLiked = false;
			}
		} catch (error) {
			console.error('Failed to like post:', error);
			likes -= 1;
			hasLiked = false;
		} finally {
			isLoading = false;
		}
	}
</script>

{#if showConfetti}
	<ConfettiCannon
		origin={[window.innerWidth / 2, window.innerHeight]}
		angle={-90}
		spread={45}
		force={40}
		particleCount={50}
	/>
{/if}

<div class="flex items-center gap-6 pb-4">
	<div class="flex items-center gap-4">
		<button
			onclick={handleLike}
			disabled={hasLiked || isLoading}
			class={`group flex items-center gap-2 rounded-full px-5 py-2.5 transition-all duration-300 ${
				hasLiked
					? 'bg-primary/10 text-primary shadow-sm shadow-primary/5'
					: 'bg-muted hover:bg-primary/5 hover:text-primary hover:shadow-lg hover:shadow-primary/10'
			}`}
			aria-label="Like this post"
		>
			<Heart
				class={`size-5 transition-transform duration-300 ${
					hasLiked ? 'scale-110 fill-primary' : 'group-hover:scale-125'
				}`}
			/>
			<span class="font-bold">{likes}</span>
		</button>

		<div class="flex items-center gap-2 px-3 py-2 text-muted-foreground">
			<Eye class="size-5" />
			<span class="font-medium">{views} {m.blog_views()}</span>
		</div>
	</div>

	<div class="hidden sm:block">
		<button
			onclick={handleLike}
			disabled={hasLiked || isLoading}
			class="cursor-pointer text-sm italic transition-colors select-none enabled:hover:text-primary disabled:cursor-default"
		>
			<p class="text-muted-foreground transition-colors group-hover:text-primary">
				{hasLiked ? m.blog_reaction_thanks() : m.blog_reaction_question()}
			</p>
		</button>
	</div>
</div>

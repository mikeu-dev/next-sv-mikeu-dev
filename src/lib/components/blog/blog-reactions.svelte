<script lang="ts">
	import { Heart, Eye } from '@lucide/svelte';
	import { page } from '$app/state';
	import { onMount, tick } from 'svelte';
	import { ConfettiCannon } from 'svelte-canvas-confetti';

	let { reactions = { likes: 0, views: 0 } } = $props<{
		reactions: { likes: number; views: number };
	}>();

	let likes = $state(reactions.likes);
	let views = $state(reactions.views);
	let hasLiked = $state(false);
	let isLoading = $state(false);
	let showConfetti = $state(false);

	onMount(() => {
		// Simple local storage to prevent multiple likes from same browser
		const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
		hasLiked = likedPosts.includes(page.params.slug);
	});

	async function handleLike() {
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
			const res = await fetch(`/api/blog/${page.params.slug}/like`, {
				method: 'POST'
			});

			if (res.ok) {
				const data = await res.json();
				likes = data.likes;
				
				// Save to local storage
				const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
				likedPosts.push(page.params.slug);
				localStorage.setItem('liked_posts', JSON.stringify(likedPosts));
			} else {
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

<div class="flex items-center gap-6 border-t pt-10 pb-4">
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
					hasLiked ? 'fill-primary scale-110' : 'group-hover:scale-125'
				}`}
			/>
			<span class="font-bold">{likes}</span>
		</button>

		<div class="flex items-center gap-2 px-3 py-2 text-muted-foreground">
			<Eye class="size-5" />
			<span class="font-medium">{views} views</span>
		</div>
	</div>

	<div class="hidden sm:block">
		<p class="text-sm text-muted-foreground italic">
			{hasLiked ? 'Thank you for your feedback!' : 'Did you find this helpful?'}
		</p>
	</div>
</div>

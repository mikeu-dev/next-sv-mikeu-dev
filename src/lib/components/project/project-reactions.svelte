<script lang="ts">
	import { Heart, Eye } from '@lucide/svelte';
	import { page } from '$app/state';
	import { onMount, tick } from 'svelte';
	import { m } from '$lib/paraglide/messages';
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
		likes = reactions?.likes ?? 0;
		views = reactions?.views ?? 0;
	});

	onMount(() => {
		// Simple local storage to prevent multiple likes from same browser
		const likedProjects = JSON.parse(localStorage.getItem('liked_projects') || '[]');
		hasLiked = likedProjects.includes(page.params.slug);
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
			const res = await fetch(`/api/projects/${page.params.slug}/like`, {
				method: 'POST'
			});

			if (res.ok) {
				const data = await res.json();
				likes = data.likes;

				// Save to local storage
				const likedProjects = JSON.parse(localStorage.getItem('liked_projects') || '[]');
				if (!likedProjects.includes(page.params.slug)) {
					likedProjects.push(page.params.slug);
					localStorage.setItem('liked_projects', JSON.stringify(likedProjects));
				}
			} else {
				// Rollback if failed
				likes -= 1;
				hasLiked = false;
			}
		} catch (error) {
			console.error('Failed to like project:', error);
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
					? 'text-primary-foreground shadow-primary/5 bg-emerald shadow-sm'
					: 'bg-muted text-muted-foreground hover:text-primary hover:shadow-primary/10 hover:bg-emerald/10 hover:shadow-lg'
			}`}
			aria-label="Like this project"
		>
			<Heart
				class={`size-5 transition-transform duration-300 ${
					hasLiked ? 'fill-primary-foreground scale-110' : 'group-hover:scale-125'
				}`}
			/>
			<span class="font-bold">{likes}</span>
		</button>

		<div
			class="text-card-foreground/60 dark:text-muted-foreground flex items-center gap-2 px-3 py-2"
		>
			<Eye class="size-5" />
			<span class="font-medium">{views} {m.blog_views()}</span>
		</div>
	</div>

	<div class="hidden sm:block">
		<button
			onclick={handleLike}
			disabled={hasLiked || isLoading}
			class="enabled:hover:text-primary cursor-pointer text-sm italic transition-colors select-none disabled:cursor-default"
		>
			<p
				class="text-card-foreground/60 group-hover:text-primary dark:text-muted-foreground transition-colors"
			>
				{hasLiked ? m.blog_reaction_thanks() : m.blog_reaction_question()}
			</p>
		</button>
	</div>
</div>

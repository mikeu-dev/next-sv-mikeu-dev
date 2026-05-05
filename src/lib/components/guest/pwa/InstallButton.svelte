<script lang="ts">
	import { pwaState } from '$lib/stores/pwa.svelte';
	import { m } from '@/lib/paraglide/messages';
	import { Download, Smartphone } from '@lucide/svelte';
	import { ConfettiCannon } from 'svelte-canvas-confetti';
	import { playConfettiSound } from '$lib/utils/confetti-sound';
	import { tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import { cn } from '$lib/utils';

	let { class: className = '' } = $props();
	let confettiCannon = $state(false);

	const handleInstall = async () => {
		confettiCannon = false;
		await tick();
		confettiCannon = true;
		playConfettiSound();
		await pwaState.install();
	};
</script>

{#if pwaState.isInstallable}
	<div class={cn('relative inline-flex', className)} transition:fade>
		{#if confettiCannon}
			<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
				<ConfettiCannon
					origin={[window.innerWidth / 2, window.innerHeight]}
					angle={-90}
					spread={35}
					force={35}
				/>
			</div>
		{/if}

		<button
			onclick={handleInstall}
			class="group flex h-10 cursor-pointer items-center gap-2 border-2 border-foreground bg-background px-4 font-mono text-[10px] font-black uppercase tracking-widest transition-all hover:-translate-x-1 hover:-translate-y-1 hover:bg-foreground hover:text-background hover:shadow-[4px_4px_0_var(--primary)] active:translate-x-0 active:translate-y-0 active:shadow-none install-btn-origami"
		>
			<Smartphone class="size-3 transition-transform group-hover:scale-110" />
			<span>{m.pwa_install_button()}</span>
			<Download class="size-2 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
		</button>
	</div>
{/if}

<style lang="postcss">
	@reference "tailwindcss";

	.install-btn-origami {
		clip-path: polygon(0 0, 90% 0, 100% 25%, 100% 100%, 10% 100%, 0 75%);
		transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
	}

	.install-btn-origami:hover {
		clip-path: polygon(10% 0, 100% 0, 90% 75%, 90% 100%, 0 100%, 0 25%);
	}
</style>

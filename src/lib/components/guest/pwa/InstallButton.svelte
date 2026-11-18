<script lang="ts">
	import { pwaState } from '#lib/stores/pwa.svelte.js';
	import { m } from '#lib/paraglide/messages.js';
	import { Download, Smartphone } from '@lucide/svelte';
	import { ConfettiCannon } from 'svelte-canvas-confetti';
	import { playConfettiSound } from '#lib/utils/confetti-sound.js';
	import { tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import { cn } from '#lib/utils.js';

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
			class="flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-4 text-[15px] font-extrabold text-ink-soft transition-colors hover:bg-secondary hover:text-foreground"
		>
			<Smartphone class="size-4" />
			<span>{m.pwa_install_button()}</span>
			<Download class="size-3.5 text-primary" />
		</button>
	</div>
{/if}

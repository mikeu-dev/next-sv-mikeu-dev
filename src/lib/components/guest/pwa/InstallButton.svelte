<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { pwaState } from '$lib/stores/pwa.svelte';
	import * as m from '@/lib/paraglide/messages';
	import SmartphoneIcon from '@lucide/svelte/icons/smartphone';
	import { ConfettiCannon } from 'svelte-canvas-confetti';
	import { tick } from 'svelte';
	import { fade } from 'svelte/transition';

	import { cn } from '$lib/utils';

	let { class: className = '' } = $props();

	let confettiCannon = $state(false);

	const handleInstall = async () => {
		// Trigger confetti
		confettiCannon = false;
		await tick();
		confettiCannon = true;

		// Trigger PWA install
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

		<Button
			variant="outline"
			onclick={handleInstall}
			class="group flex items-center gap-2 border-teal-600/50 hover:bg-teal-600/10 hover:text-teal-600 dark:border-teal-400/50 dark:hover:bg-teal-400/10 dark:hover:text-teal-400 cursor-pointer"
		>
			<SmartphoneIcon class="h-4 w-4 transition-transform group-hover:scale-110" />
			<span>{m.pwa_install_button()}</span>
		</Button>
	</div>
{/if}

<script lang="ts">
	import { page } from '$app/state';
	import { env } from '$env/dynamic/public';
	import * as Card from '$lib/components/ui/card/index.js';
	import Button from '@/lib/components/ui/button/button.svelte';
	import { DotLottieSvelte } from '@lottiefiles/dotlottie-svelte';
</script>

<div class="mt-20 flex min-h-[70vh] w-full items-center justify-center p-4">
	<Card.Root
		class="w-full max-w-3xl border-0 bg-gradient-to-b from-gray-50 to-white text-center shadow-none dark:from-gray-900 dark:to-background"
	>
		<Card.Header>
			<Card.Title class="text-3xl font-bold text-destructive">{page.status}</Card.Title>
			<Card.Description class="text-lg">Terjadi Kesalahan</Card.Description>
		</Card.Header>
		<Card.Content>
			<DotLottieSvelte src={env.PUBLIC_LOTTIE_URL} loop autoplay />
			<p class="text-muted-foreground">{page.error?.message}</p>
		</Card.Content>
		<Card.Footer class="flex justify-center">
			<Button href="/">Kembali ke Beranda</Button>
		</Card.Footer>
	</Card.Root>
</div>

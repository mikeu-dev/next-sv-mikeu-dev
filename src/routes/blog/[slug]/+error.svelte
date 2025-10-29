<script lang="ts">
	import { page } from '$app/state';
	import { env } from '$env/dynamic/public';
	import * as Card from '$lib/components/ui/card/index.js';
	import Button from '@/lib/components/ui/button/button.svelte';
	import { DotLottieSvelte } from '@lottiefiles/dotlottie-svelte';
</script>

<div class="flex min-h-[70vh] w-full items-center justify-center p-4">
	<Card.Root class="w-full max-w-3xl text-center border-0 shadow-none bg-gradient-to-b from-gray-50 to-white">
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

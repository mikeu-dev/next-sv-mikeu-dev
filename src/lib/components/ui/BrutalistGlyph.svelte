<script lang="ts">
	/**
	 * BrutalistGlyph.svelte
	 * Renders a custom geometric SVG representing a character.
	 * Designed with a "Brutalist Origami" aesthetic: faceted, sharp, and structural.
	 * Hardcoded grayscale paper textures to match the 1:1 paper architecture mockup.
	 */

	interface Props {
		char: string;
		class?: string;
	}

	let { char, class: className = '' }: Props = $props();

	// Normalize character for mapping
	const key = $derived(char.toUpperCase());
</script>

<div class="brutalist-glyph {className}" aria-hidden="true">
	{#if key === 'M'}
		<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
			<!-- Tiang kiri (Putih bersih) -->
			<polygon points="10,90 10,10 30,10 30,90" fill="#ffffff" />
			<!-- Lipatan miring kiri atas (Abu-abu terang) -->
			<polygon points="30,10 50,62 30,46" fill="#e2e2e8" />
			<!-- Lipatan miring kiri bawah/bayangan (Abu-abu gelap) -->
			<polygon points="30,46 50,62 50,85 30,90" fill="#919197" />
			<!-- Lipatan miring kanan atas (Abu-abu sedang) -->
			<polygon points="50,62 70,10 70,46" fill="#c8c8cf" />
			<!-- Lipatan miring kanan bawah/bayangan (Abu-abu sedang-gelap) -->
			<polygon points="50,62 70,46 70,90 50,85" fill="#a8a8af" />
			<!-- Tiang kanan (Putih bersih) -->
			<polygon points="70,90 70,10 90,10 90,90" fill="#ffffff" />
			<!-- Bayangan sambungan tengah atas -->
			<polygon points="30,10 50,22 70,10 50,62" fill="rgba(0,0,0,0.06)" />
		</svg>
	{:else if key === 'I'}
		<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
			<!-- Titik atas (Diamond origami) -->
			<polygon points="50,4 66,16 50,28 34,16" fill="#ffffff" />
			<polygon points="50,16 66,16 50,28" fill="#c8c8cf" />
			<polygon points="34,16 50,16 50,28" fill="#9a9a9f" />
			<!-- Tiang bawah kiri (Putih) -->
			<polygon points="38,36 50,36 50,88 38,88" fill="#ffffff" />
			<!-- Tiang bawah kanan (Abu-abu terang) -->
			<polygon points="50,36 62,36 62,88 50,88" fill="#e2e2e8" />
			<!-- Lipatan serong dasar tiang bawah -->
			<polygon points="38,88 50,88 62,88 50,94" fill="#9a9a9f" />
		</svg>
	{:else if key === 'K'}
		<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
			<!-- Tiang kiri -->
			<polygon points="15,90 15,10 35,10 35,90" fill="#ffffff" />
			<!-- Sambungan bayangan tengah -->
			<polygon points="35,42 55,52 35,62" fill="#727278" />
			<!-- Lengan kanan atas (Putih) -->
			<polygon points="35,42 82,12 68,12 35,32" fill="#ffffff" />
			<polygon points="35,32 68,12 82,12 55,52" fill="#e2e2e8" />
			<!-- Kaki kanan bawah (Abu-abu sedang) -->
			<polygon points="55,52 82,88 66,88 35,62" fill="#c8c8cf" />
			<polygon points="35,62 66,88 82,88 35,78" fill="#9a9a9f" />
		</svg>
	{:else if key === 'E'}
		<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
			<!-- Tiang kiri vertikal -->
			<polygon points="22,90 22,10 38,10 38,90" fill="#ffffff" />
			<!-- Bar atas -->
			<polygon points="38,10 78,10 78,25 38,25" fill="#ffffff" />
			<polygon points="38,25 78,25 73,31 38,31" fill="#c8c8cf" />
			<!-- Bar tengah -->
			<polygon points="38,44 70,44 63,55 38,55" fill="#e2e2e8" />
			<polygon points="38,55 63,55 59,60 38,60" fill="#9a9a9f" />
			<!-- Bar bawah -->
			<polygon points="38,75 78,75 78,90 38,90" fill="#ffffff" />
			<!-- Bayangan segitiga lipatan di pangkal kiri bawah bar tengah -->
			<polygon points="38,60 48,75 38,75" fill="#727278" />
		</svg>
	{:else if key === 'U'}
		<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
			<!-- Tiang kiri (Putih) -->
			<polygon points="15,10 33,10 33,70 15,70" fill="#ffffff" />
			<!-- Tiang kanan (Putih) -->
			<polygon points="67,10 85,10 85,70 67,70" fill="#ffffff" />
			<!-- Lipatan miring kiri bawah (Abu-abu gelap) -->
			<polygon points="15,70 33,70 33,88 15,70" fill="#9a9a9f" />
			<!-- Lipatan miring kanan bawah (Abu-abu sedang) -->
			<polygon points="67,70 85,70 67,88 67,70" fill="#c8c8cf" />
			<!-- Bar dasar bawah (Abu-abu terang) -->
			<polygon points="15,70 85,70 85,88 15,88" fill="#e2e2e8" />
			<!-- Lipatan bawah terluar -->
			<polygon points="15,88 85,88 75,94 25,94" fill="#9a9a9f" />
		</svg>
	{:else if key === 'D'}
		<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
			<!-- Tiang kiri -->
			<polygon points="15,90 15,10 33,10 33,90" fill="#ffffff" />
			<!-- Bagian atas miring -->
			<polygon points="33,10 70,10 85,28 33,28" fill="#ffffff" />
			<!-- Bagian kanan vertikal -->
			<polygon points="70,28 88,28 88,72 70,72" fill="#e2e2e8" />
			<!-- Bagian bawah miring -->
			<polygon points="33,72 85,72 70,90 33,90" fill="#c8c8cf" />
			<!-- Inner cutout shadow -->
			<polygon points="33,28 70,28 70,72 33,72 33,64 62,64 62,36 33,36" fill="#9a9a9f" />
		</svg>
	{:else if key === 'V'}
		<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
			<!-- Lengan kiri -->
			<polygon points="10,10 32,10 55,75 33,75" fill="#ffffff" />
			<!-- Lengan kanan -->
			<polygon points="90,10 68,10 45,75 67,75" fill="#e2e2e8" />
			<!-- Pertemuan bawah/lipatan -->
			<polygon points="33,75 55,75 50,92" fill="#9a9a9f" />
			<polygon points="45,75 67,75 50,92" fill="#c8c8cf" />
		</svg>
	{:else if key === ' '}
		<div class="w-6"></div>
	{:else}
		<span class="text-4xl font-black">{char}</span>
	{/if}
</div>

<style lang="postcss">
	.brutalist-glyph {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	svg {
		width: 100%;
		height: 100%;
		filter: drop-shadow(4px 10px 8px rgba(0, 0, 0, 0.45));
	}

	:global(.dark) svg {
		filter: drop-shadow(4px 12px 10px rgba(0, 0, 0, 0.65));
	}
</style>

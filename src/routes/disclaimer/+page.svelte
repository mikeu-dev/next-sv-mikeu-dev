<script lang="ts">
	import SEO from '$lib/components/seo/seo.svelte';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	const lastUpdated = '7 April 2026';

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);
		const tl = gsap.timeline();
		tl.fromTo(
			'.legal-stagger',
			{ opacity: 0, y: 20 },
			{ opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
		);
	});
</script>

<SEO title="Disclaimer" description="Disclaimer for Mikeu Dev (Riki Ruswandi)" />

<!-- eslint-disable svelte/no-navigation-without-resolve -->
<article class="mx-auto prose mt-20 max-w-4xl py-12 prose-slate dark:prose-invert">
	<h1 class="legal-stagger mb-8 font-poppins text-4xl font-black tracking-tight md:text-5xl">
		Disclaimer<span class="text-primary">.</span>
	</h1>
	<p class="legal-stagger mb-12 text-sm text-muted-foreground italic">
		Last Updated: {lastUpdated}
	</p>

	<section class="legal-stagger mt-12">
		<h2 class="font-poppins text-2xl font-bold tracking-tight">1. General Information</h2>
		<p>
			The information provided on the <strong>Mikeu Dev</strong> website (<a
				href="https://www.mikeudev.my.id">https://www.mikeudev.my.id</a
			>) is for general informational purposes only. All information on the site is provided in good
			faith, however we make no representation or warranty of any kind, express or implied,
			regarding the accuracy, adequacy, validity, reliability, availability or completeness of any
			information on the site.
		</p>
	</section>

	<section class="mt-8">
		<h2 class="text-2xl font-semibold">2. Professional Disclaimer</h2>
		<p>
			The site cannot and does not contain professional advice. Any information provided is for
			general educational and informational purposes only and is not a substitute for professional
			advice. Accordingly, before taking any actions based upon such information, we encourage you
			to consult with the appropriate professionals. We do not provide any kind of professional
			advice. THE USE OR RELIANCE OF ANY INFORMATION CONTAINED ON THIS SITE IS SOLELY AT YOUR OWN
			RISK.
		</p>
	</section>

	<section class="mt-8">
		<h2 class="text-2xl font-semibold">3. External Links Disclaimer</h2>
		<p>
			The site may contain (or you may be sent through the site) links to other websites or content
			belonging to or originating from third parties or links to websites and features in banners or
			other advertising. Such external links are not investigated, monitored, or checked for
			accuracy, adequacy, validity, reliability, availability or completeness by us.
		</p>
	</section>

	<section class="mt-8">
		<h2 class="text-2xl font-semibold">4. Errors and Omissions Disclaimer</h2>
		<p>
			While we have made every attempt to ensure that the information contained in this site has
			been obtained from reliable sources,
			<strong>Riki Ruswandi</strong> is not responsible for any errors or omissions, or for the results
			obtained from the use of this information.
		</p>
	</section>

	<section class="mt-8">
		<h2 class="text-2xl font-semibold">5. Logos and Trademarks Disclaimer</h2>
		<p>
			All logos and trademarks of third parties referenced on <a href="https://www.mikeudev.my.id"
				>https://www.mikeudev.my.id</a
			>
			are the trademarks and logos of their respective owners. Any inclusion of such trademarks or logos
			does not imply or constitute any approval, endorsement or sponsorship of
			<strong>Mikeu Dev</strong> by such owners.
		</p>
	</section>

	<section class="mt-8">
		<h2 class="text-2xl font-semibold">6. Contact Us</h2>
		<p>
			Should you have any feedback, comments, requests for technical support or other inquiries,
			please contact us by email:
			<a href="mailto:rikiruswandi28@gmail.com">rikiruswandi28@gmail.com</a>.
		</p>
	</section>
</article>

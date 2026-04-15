<script lang="ts">
	import SEO from '$lib/components/seo/seo.svelte';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	const lastUpdated = '7 April 2026';

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);
		gsap.fromTo(
			'.legal-stagger',
			{ opacity: 0, y: 20 },
			{
				opacity: 1,
				y: 0,
				duration: 0.6,
				stagger: 0.1,
				ease: 'power2.out'
			}
		);
	});
</script>

<SEO title="Privacy Policy" description="Privacy Policy for Mikeu Dev (Riki Ruswandi)" />

<!-- eslint-disable svelte/no-navigation-without-resolve -->
<article class="prose prose-slate mx-auto mt-20 max-w-4xl py-12 dark:prose-invert">
	<h1 class="font-poppins legal-stagger mb-8 text-4xl font-black tracking-tight md:text-5xl">
		Privacy Policy<span class="text-primary">.</span>
	</h1>
	<p class="legal-stagger mb-12 text-sm italic text-muted-foreground">Last Updated: {lastUpdated}</p>

	<section class="legal-stagger mt-12">
		<h2 class="font-poppins text-2xl font-bold tracking-tight">1. Introduction</h2>
		<p>
			Welcome to <strong>Mikeu Dev</strong> (available at
			<a href="https://www.mikeudev.my.id">https://www.mikeudev.my.id</a>). This website is owned
			and operated by <strong>Riki Ruswandi</strong>. We respect your privacy and are committed to
			protecting your personal data. This privacy policy will inform you as to how we look after
			your personal data when you visit our website and tell you about your privacy rights.
		</p>
	</section>

	<section class="mt-8">
		<h2 class="text-2xl font-semibold">2. The Data We Collect</h2>
		<p>
			We may collect, use, store and transfer different kinds of personal data about you which we
			have grouped together as follows:
		</p>
		<ul class="list-disc pl-6">
			<li><strong>Identity Data</strong> includes first name, last name, or similar identifier.</li>
			<li>
				<strong>Contact Data</strong> includes email address (e.g., when you use our contact form).
			</li>
			<li>
				<strong>Technical Data</strong> includes internet protocol (IP) address, browser type and version,
				time zone setting and location, browser plug-in types and versions, operating system and platform.
			</li>
			<li><strong>Usage Data</strong> includes information about how you use our website.</li>
		</ul>
	</section>

	<section class="mt-8">
		<h2 class="text-2xl font-semibold">3. How We Use Your Data</h2>
		<p>
			We will only use your personal data when the law allows us to. Most commonly, we will use your
			personal data in the following circumstances:
		</p>
		<ul class="list-disc pl-6">
			<li>To provide and maintain our Service.</li>
			<li>To notify you about changes to our Service.</li>
			<li>
				To allow you to participate in interactive features of our Service when you choose to do so.
			</li>
			<li>To provide customer support and respond to inquiries.</li>
			<li>To gather analysis or valuable information so that we can improve our Service.</li>
		</ul>
	</section>

	<section class="mt-8">
		<h2 class="text-2xl font-semibold">4. Cookies and Tracking Technologies</h2>
		<p>
			We use cookies and similar tracking technologies to track the activity on our Service and hold
			certain information. Cookies are files with small amount of data which may include an
			anonymous unique identifier. You can instruct your browser to refuse all cookies or to
			indicate when a cookie is being sent.
		</p>
		<p class="mt-4">
			<strong>Google AdSense:</strong> We use Google AdSense to serve advertisements on our site.
			Google and its third-party partners use cookies to serve ads based on your prior visits to our
			site or other websites. These advertising cookies enable Google and its partners to serve ads
			to you based on your visits to our site and/or other sites on the Internet.
		</p>
		<p class="mt-4">
			You may opt out of personalized advertising by visiting
			<a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer"
				>Ads Settings</a
			>. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized
			advertising by visiting
			<a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer"
				>www.aboutads.info</a
			>.
		</p>
	</section>

	<section class="mt-8">
		<h2 class="text-2xl font-semibold">5. Data Security</h2>
		<p>
			The security of your data is important to us, but remember that no method of transmission over
			the Internet, or method of electronic storage is 100% secure. While we strive to use
			commercially acceptable means to protect your personal data, we cannot guarantee its absolute
			security.
		</p>
	</section>

	<section class="mt-8">
		<h2 class="text-2xl font-semibold">6. Contact Us</h2>
		<p>If you have any questions about this Privacy Policy, please contact us:</p>
		<ul class="mt-4 list-none italic">
			<li>By email: <a href="mailto:rikiruswandi28@gmail.com">rikiruswandi28@gmail.com</a></li>
			<li>
				By visiting this page on our website: <a href="/contact"
					>https://www.mikeudev.my.id/contact</a
				>
			</li>
		</ul>
	</section>
</article>

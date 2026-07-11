<script lang="ts">
	import { Bell, BellRing, Loader2 } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { toast } from 'svelte-sonner';

	let isSubscribed = $state(false);
	let isLoading = $state(false);
	let isSupported = $state(false);

	onMount(async () => {
		if ('serviceWorker' in navigator && 'PushManager' in window) {
			isSupported = true;
			const registration = await navigator.serviceWorker.getRegistration();
			if (registration) {
				const subscription = await registration.pushManager.getSubscription();
				isSubscribed = !!subscription;
			}
		}
	});

	function urlB64ToUint8Array(base64String: string) {
		const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

		const rawData = window.atob(base64);
		const outputArray = new Uint8Array(rawData.length);

		for (let i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i);
		}
		return outputArray;
	}

	async function subscribeToPush() {
		isLoading = true;
		try {
			const permission = await Notification.requestPermission();
			if (permission !== 'granted') {
				toast.error('Permission for notifications was denied');
				return;
			}

			const registration = await navigator.serviceWorker.ready;
			const applicationServerKey = urlB64ToUint8Array(env.PUBLIC_VAPID_KEY);

			const subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey
			});

			// Send to backend
			const res = await fetch('/api/admin/push', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(subscription)
			});

			if (!res.ok) throw new Error('Failed to save subscription');

			isSubscribed = true;
			toast.success('Successfully subscribed to web push notifications!');
		} catch (error) {
			console.error('Failed to subscribe:', error);
			toast.error('Gagal mengaktifkan notifikasi: ' + (error as Error).message);
		} finally {
			isLoading = false;
		}
	}
</script>

{#if isSupported}
	<div class="mt-8 rounded-xl border bg-card shadow-sm">
		<div class="p-6 text-foreground">
			<h3 class="mb-2 flex items-center gap-2 font-semibold">
				{#if isSubscribed}
					<BellRing class="h-4 w-4 text-green-500" /> Web Push Notifications
				{:else}
					<Bell class="h-4 w-4" /> Web Push Notifications
				{/if}
			</h3>
			<div class="space-y-4 text-sm text-muted-foreground">
				<p>
					{#if isSubscribed}
						Perangkat ini sudah terdaftar untuk menerima notifikasi pesan masuk.
					{:else}
						Terima notifikasi di perangkat ini setiap kali ada pesan kontak baru yang masuk.
					{/if}
				</p>

				{#if !isSubscribed}
					<button
						class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
						onclick={subscribeToPush}
						disabled={isLoading}
					>
						{#if isLoading}
							<Loader2 class="h-4 w-4 animate-spin" /> Mengaktifkan...
						{:else}
							<BellRing class="h-4 w-4" /> Aktifkan Notifikasi
						{/if}
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

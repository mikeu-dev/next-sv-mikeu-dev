<script lang="ts">
	import { onMount } from 'svelte';
	import { 
		BarChart3, 
		PieChart, 
		Globe, 
		Monitor, 
		Smartphone, 
		Link2, 
		Eye, 
		TrendingUp,
		Clock,
		RefreshCw
	} from '@lucide/svelte';
	import type { VisitorAnalytics } from '$lib/server/services/visitor.service';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils';
	import { fade, fly } from 'svelte/transition';

	let analytics = $state<VisitorAnalytics | null>(null);
	let loading = $state(true);
	let days = $state(30);

	async function fetchAnalytics() {
		loading = true;
		try {
			const res = await fetch(`/api/admin/analytics?days=${days}`);
			if (res.ok) {
				analytics = await res.json();
			} else {
				toast.error('Failed to fetch analytics');
			}
		} catch {
			toast.error('Request failed');
		} finally {
			loading = false;
		}
	}

	onMount(fetchAnalytics);

	$effect(() => {
		if (days) fetchAnalytics();
	});

	function getPercentage(value: number, total: number) {
		if (total === 0) return 0;
		return Math.round((value / total) * 100);
	}

	const totalVisits = $derived(
		analytics?.deviceMix.reduce((acc, [, count]) => acc + count, 0) || 0
	);
</script>

<div class="space-y-8 p-6">
	<!-- Header -->
	<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<div>
			<h1 class="flex items-center gap-2 text-3xl font-bold tracking-tight">
				<BarChart3 class="h-8 w-8 text-primary" />
				Visitor Analytics
			</h1>
			<p class="text-muted-foreground">Deep dive into your portfolio's audience and traffic patterns.</p>
		</div>

		<div class="flex items-center gap-2">
			<div class="flex items-center rounded-lg border bg-muted/50 p-1">
				{#each [7, 30, 90] as d (d)}
					<button
						class={cn(
							'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
							days === d ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
						)}
						onclick={() => (days = d)}
					>
						Last {d} Days
					</button>
				{/each}
			</div>
			<Button variant="outline" size="icon" onclick={fetchAnalytics} disabled={loading}>
				<RefreshCw class={cn('h-4 w-4', loading && 'animate-spin')} />
			</Button>
		</div>
	</div>

	{#if loading && !analytics}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
			{#each Array(4) as item, i (i)}
				<div class="h-32 animate-pulse rounded-xl border bg-muted/20" data-item={JSON.stringify(item)} data-idx={i}></div>
			{/each}
		</div>
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div class="h-[400px] animate-pulse rounded-xl border bg-muted/20 lg:col-span-2"></div>
			<div class="h-[400px] animate-pulse rounded-xl border bg-muted/20"></div>
		</div>
	{:else if analytics}
		<!-- Quick Stats -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4" in:fade>
			{#each Array(4) as item, i (i)}
				{#if i === 0}
					<div class="rounded-xl border bg-card p-6 shadow-sm" data-item={JSON.stringify(item)} data-stat={i}>
						<div class="mb-4 flex items-center justify-between">
							<span class="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
								<Eye class="h-5 w-5" />
							</span>
							<span class="text-xs font-medium text-muted-foreground">Log Capacity</span>
						</div>
						<p class="text-sm font-medium text-muted-foreground">Total Analyzed</p>
						<p class="text-3xl font-bold">{totalVisits}</p>
					</div>
				{:else if i === 1}
					<div class="rounded-xl border bg-card p-6 shadow-sm">
						<div class="mb-4 flex items-center justify-between">
							<span class="rounded-full bg-green-100 p-2 text-green-600 dark:bg-green-900/40 dark:text-green-400">
								<TrendingUp class="h-5 w-5" />
							</span>
							<span class="text-xs font-medium text-muted-foreground">Page Views</span>
						</div>
						<p class="text-sm font-medium text-muted-foreground">Unique Paths</p>
						<p class="text-3xl font-bold">{analytics.topPages.length}</p>
					</div>
				{:else if i === 2}
					<div class="rounded-xl border bg-card p-6 shadow-sm">
						<div class="mb-4 flex items-center justify-between">
							<span class="rounded-full bg-purple-100 p-2 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400">
								<Globe class="h-5 w-5" />
							</span>
							<span class="text-xs font-medium text-muted-foreground">Main Source</span>
						</div>
						<p class="text-sm font-medium text-muted-foreground">Dominant Referrer</p>
						<p class="text-3xl font-bold truncate">{analytics.referrers[0]?.[0] || 'Direct'}</p>
					</div>
				{:else if i === 3}
					<div class="rounded-xl border bg-card p-6 shadow-sm">
						<div class="mb-4 flex items-center justify-between">
							<span class="rounded-full bg-orange-100 p-2 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400">
								<Clock class="h-5 w-5" />
							</span>
							<span class="text-xs font-medium text-muted-foreground">Retention</span>
						</div>
						<p class="text-sm font-medium text-muted-foreground">Data Window</p>
						<p class="text-3xl font-bold">{days} Days</p>
					</div>
				{/if}
			{/each}
		</div>

		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<!-- Top Pages -->
			<div class="rounded-xl border bg-card shadow-sm lg:col-span-2" in:fly={{ y: 20, delay: 100 }}>
				<div class="border-b p-6">
					<h2 class="flex items-center gap-2 text-lg font-semibold">
						<Link2 class="h-5 w-5 text-primary" />
						Top Visited Pages
					</h2>
				</div>
				<div class="space-y-1 p-4">
					{#each analytics.topPages as [path, count], i (path)}
						<div class="group flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50">
							<div class="flex min-w-0 items-center gap-3">
								<span class="text-xs font-bold text-muted-foreground/50 w-4">{i + 1}</span>
								<div class="flex flex-col truncate">
									<span class="truncate font-medium">{path === '/' ? 'Home Page' : path}</span>
									<span class="text-[10px] text-muted-foreground truncate">{path}</span>
								</div>
							</div>
							<div class="flex items-center gap-4">
								<div class="hidden w-24 overflow-hidden rounded-full bg-muted md:block">
									<div 
										class="h-1.5 bg-primary transition-all duration-1000" 
										style="width: {getPercentage(count, analytics.topPages[0][1])}%"
									></div>
								</div>
								<span class="text-sm font-bold">{count}</span>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Device & Traffic Mix -->
			<div class="space-y-8" in:fly={{ y: 20, delay: 200 }}>
				<!-- Device Distribution -->
				<div class="rounded-xl border bg-card p-6 shadow-sm">
					<h2 class="mb-6 flex items-center gap-2 text-lg font-semibold">
						<PieChart class="h-5 w-5 text-primary" />
						Device Distribution
					</h2>
					<div class="space-y-6">
						{#each analytics.deviceMix as [device, count] (device)}
							<div class="space-y-2">
								<div class="flex items-center justify-between text-sm">
									<span class="flex items-center gap-2 font-medium capitalize">
										{#if device.toLowerCase().includes('mobile')}
											<Smartphone class="h-4 w-4 text-blue-500" />
										{:else}
											<Monitor class="h-4 w-4 text-green-500" />
										{/if}
										{device}
									</span>
									<span class="text-muted-foreground">{getPercentage(count, totalVisits)}%</span>
								</div>
								<div class="h-2 w-full overflow-hidden rounded-full bg-muted">
									<div 
										class={cn(
											"h-full transition-all duration-1000",
											device.toLowerCase().includes('mobile') ? "bg-blue-500" : "bg-green-500"
										)}
										style="width: {getPercentage(count, totalVisits)}%"
									></div>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Traffic Sources -->
				<div class="rounded-xl border bg-card p-6 shadow-sm">
					<h2 class="mb-6 flex items-center gap-2 text-lg font-semibold">
						<Globe class="h-5 w-5 text-primary" />
						Top Referrers
					</h2>
					<div class="space-y-4">
						{#each analytics.referrers as [ref, count] (ref)}
							<div class="flex items-center justify-between text-sm">
								<span class="flex items-center gap-2 truncate font-medium">
									<div class="h-2 w-2 rounded-full bg-primary/40"></div>
									{ref}
								</span>
								<span class="font-bold">{count}</span>
							</div>
						{/each}
						{#if analytics.referrers.length === 0}
							<p class="text-center text-xs text-muted-foreground">No referrer data available.</p>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

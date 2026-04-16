<script lang="ts">
	import { onMount } from 'svelte';
	import {
		AlertCircle,
		Terminal,
		Trash2,
		RefreshCw,
		Smartphone,
		Monitor,
		Globe,
		ChevronDown,
		ChevronUp,
		Clock
	} from '@lucide/svelte';
	import type { AppErrorLog } from '$lib/server/services/monitoring.service';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils';
	import { slide } from 'svelte/transition';

	let logs = $state<AppErrorLog[]>([]);
	let loading = $state(true);
	let expandedLogId = $state<string | null>(null);
	let filterType = $state<'all' | 'server' | 'client'>('all');

	async function fetchLogs() {
		loading = true;
		try {
			const res = await fetch('/api/admin/monitoring');
			if (res.ok) {
				logs = await res.json();
			} else {
				toast.error('Failed to fetch logs');
			}
		} catch {
			toast.error('Request failed');
		} finally {
			loading = false;
		}
	}

	async function clearLogs(days: number) {
		if (!confirm(`Are you sure you want to clear logs older than ${days} days?`)) return;

		try {
			const res = await fetch(`/api/admin/monitoring?days=${days}`, { method: 'DELETE' });
			if (res.ok) {
				const result = await res.json();
				toast.success(`Cleared ${result.cleared} logs`);
				fetchLogs();
			}
		} catch {
			toast.error('Failed to clear logs');
		}
	}

	onMount(fetchLogs);

	const filteredLogs = $derived(
		filterType === 'all' ? logs : logs.filter((l) => l.type === filterType)
	);

	function formatDate(date: string | Date) {
		return new Date(date).toLocaleString('id-ID', {
			dateStyle: 'medium',
			timeStyle: 'short'
		});
	}

	function toggleExpand(id: string) {
		expandedLogId = expandedLogId === id ? null : id;
	}
</script>

<div class="space-y-6 p-6">
	<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<div>
			<h1 class="flex items-center gap-2 text-3xl font-bold tracking-tight">
				<AlertCircle class="h-8 w-8 text-red-500" />
				System Monitoring
			</h1>
			<p class="text-muted-foreground">Monitor and track application errors in real-time.</p>
		</div>

		<div class="flex items-center gap-2">
			<Button variant="outline" size="sm" onclick={fetchLogs} disabled={loading}>
				<RefreshCw class={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
				Refresh
			</Button>

			<div class="relative group">
				<Button variant="destructive" size="sm">
					<Trash2 class="mr-2 h-4 w-4" />
					Clear Logs
				</Button>
				<div class="absolute right-0 top-full z-10 mt-2 hidden w-48 rounded-md border bg-popover p-1 shadow-md group-hover:block transition-all">
					<button 
						class="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
						onclick={() => clearLogs(1)}
					>Older than 1 day</button>
					<button 
						class="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
						onclick={() => clearLogs(7)}
					>Older than 7 days</button>
					<button 
						class="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
						onclick={() => clearLogs(0)}
					>Clear All</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Stats & Filters -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-4">
		<button
			class={cn(
				'flex flex-col rounded-xl border p-4 text-left transition-all hover:bg-accent',
				filterType === 'all' && 'border-primary ring-1 ring-primary'
			)}
			onclick={() => (filterType = 'all')}
		>
			<span class="text-sm font-medium text-muted-foreground">Total Logs</span>
			<span class="text-2xl font-bold">{logs.length}</span>
		</button>
		<button
			class={cn(
				'flex flex-col rounded-xl border p-4 text-left transition-all hover:bg-red-50 dark:hover:bg-red-950/20',
				filterType === 'server' && 'border-red-500 ring-1 ring-red-500'
			)}
			onclick={() => (filterType = 'server')}
		>
			<span class="text-sm font-medium text-red-500">Server Errors</span>
			<span class="text-2xl font-bold">{logs.filter((l) => l.type === 'server').length}</span>
		</button>
		<button
			class={cn(
				'flex flex-col rounded-xl border p-4 text-left transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20',
				filterType === 'client' && 'border-blue-500 ring-1 ring-blue-500'
			)}
			onclick={() => (filterType = 'client')}
		>
			<span class="text-sm font-medium text-blue-500">Client Errors</span>
			<span class="text-2xl font-bold">{logs.filter((l) => l.type === 'client').length}</span>
		</button>
		<div class="flex flex-col rounded-xl border bg-accent/50 p-4">
			<span class="text-sm font-medium text-muted-foreground">Database</span>
			<span class="text-2xl font-bold">Firestore</span>
		</div>
	</div>

	<!-- Logs Table -->
	<div class="rounded-xl border bg-card text-card-foreground shadow">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead class="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
					<tr>
						<th class="px-4 py-3">Type</th>
						<th class="px-4 py-3">Message</th>
						<th class="px-4 py-3">URL</th>
						<th class="px-4 py-3 text-right">Time</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#if loading && logs.length === 0}
						{#each Array(5) as i (i)}
							<tr class="animate-pulse">
								<td class="px-4 py-4"><div class="h-4 w-12 rounded bg-muted"></div></td>
								<td class="px-4 py-4"><div class="h-4 w-full rounded bg-muted"></div></td>
								<td class="px-4 py-4"><div class="h-4 w-24 rounded bg-muted"></div></td>
								<td class="px-4 py-4"><div class="h-4 w-20 rounded bg-muted ml-auto"></div></td>
							</tr>
						{/each}
					{:else if filteredLogs.length === 0}
						<tr>
							<td colspan="4" class="px-4 py-12 text-center text-muted-foreground">
								No error logs found.
							</td>
						</tr>
					{:else}
						{#each filteredLogs as log (log.id)}
							<tr class="group hover:bg-muted/30 transition-colors">
								<td class="px-4 py-4 align-top">
									<span
										class={cn(
											'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
											log.type === 'server'
												? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
												: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
										)}
									>
										{#if log.type === 'server'}
											<Terminal class="h-3 w-3" />
										{:else}
											<Globe class="h-3 w-3" />
										{/if}
										{log.type}
									</span>
								</td>
								<td class="px-4 py-4 align-top">
									<button 
										class="block w-full text-left focus:outline-none"
										onclick={() => toggleExpand(log.id!)}
									>
										<div class="mb-1 font-semibold text-foreground line-clamp-1 group-hover:text-primary">
											{log.message}
										</div>
										<div class="flex items-center gap-3 text-xs text-muted-foreground">
											<span class="flex items-center gap-1">
												{#if log.userAgent?.includes('Mobi')}
													<Smartphone class="h-3 w-3" />
												{:else}
													<Monitor class="h-3 w-3" />
												{/if}
												Browser
											</span>
											{#if log.status}
												<span class="font-mono text-red-500">Status: {log.status}</span>
											{/if}
											<span class="flex items-center gap-0.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
												Details {#if expandedLogId === log.id}<ChevronUp class="h-3 w-3"/>{:else}<ChevronDown class="h-3 w-3"/>{/if}
											</span>
										</div>
									</button>

									{#if expandedLogId === log.id}
										<div transition:slide class="mt-4 space-y-3 rounded-lg bg-muted/50 p-4 font-mono text-xs">
											<div class="grid grid-cols-1 gap-2 md:grid-cols-2">
												<div>
													<span class="font-bold text-muted-foreground">User Agent:</span>
													<div class="break-all">{log.userAgent || 'Unknown'}</div>
												</div>
												<div>
													<span class="font-bold text-muted-foreground">Locale:</span>
													<div>{log.locale || 'Unknown'}</div>
												</div>
											</div>
											{#if log.stack}
												<div class="mt-2">
													<div class="mb-1 font-bold text-muted-foreground uppercase tracking-tighter">Stack Trace:</div>
													<pre class="max-h-60 overflow-auto whitespace-pre-wrap rounded border bg-black/10 p-2 text-[10px] dark:bg-white/5">{log.stack}</pre>
												</div>
											{/if}
											{#if log.context}
												<div class="mt-2">
													<div class="mb-1 font-bold text-muted-foreground">Extra Context:</div>
													<pre class="overflow-auto rounded border bg-black/10 p-2 dark:bg-white/5">{JSON.stringify(log.context, null, 2)}</pre>
												</div>
											{/if}
										</div>
									{/if}
								</td>
								<td class="px-4 py-4 text-xs text-muted-foreground align-top">
									<div class="w-24 truncate md:w-48" title={log.url}>{log.url}</div>
								</td>
								<td class="px-4 py-4 text-right text-xs text-muted-foreground align-top whitespace-nowrap">
									<div class="flex flex-col items-end">
										<span class="flex items-center gap-1"><Clock class="h-3 w-3"/> {formatDate(log.timestamp)}</span>
										<span class="text-[10px] opacity-70">WIB</span>
									</div>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

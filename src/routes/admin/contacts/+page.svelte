<script lang="ts">
	import { onMount } from 'svelte';
	import type { Contact } from '$lib/types';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { base } from '$app/paths';

	let contacts: Contact[] = [];
	let loading = true;
	let searchQuery = '';

	onMount(async () => {
		try {
			const res = await fetch('/api/admin/contacts');
			if (res.ok) {
				const data = await res.json();
				contacts = data.contacts;
			} else {
				toast.error('Failed to load contacts');
			}
		} catch (e) {
			console.error(e);
			toast.error('Error loading contacts');
		} finally {
			loading = false;
		}
	});

	function getStatusClass(status?: string) {
		const base =
			'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
		switch (status) {
			case 'new':
				return `${base} bg-blue-500 text-white hover:bg-blue-600`;
			case 'in-review':
				return `${base} bg-yellow-500 text-white hover:bg-yellow-600`;
			case 'replied':
				return `${base} bg-green-500 text-white hover:bg-green-600`;
			case 'closed':
				return `${base} bg-gray-500 text-white hover:bg-gray-600`;
			default:
				return `${base} bg-blue-500 text-white`;
		}
	}

	$: filteredContacts = contacts.filter(
		(c) =>
			c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
			c.company?.toLowerCase().includes(searchQuery.toLowerCase())
	);
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-3xl font-bold tracking-tight">Inbox / Leads</h2>
		<Button variant="outline" onclick={() => window.location.reload()}>Refresh</Button>
	</div>

	<div class="flex items-center py-4">
		<Input placeholder="Filter emails..." class="max-w-sm" bind:value={searchQuery} />
	</div>

	<div class="rounded-md border">
		<div class="w-full overflow-auto">
			<table class="w-full caption-bottom text-sm">
				<thead class="[&_tr]:border-b">
					<tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
						<th
							class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
							>Date</th
						>
						<th
							class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
							>Name</th
						>
						<th
							class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
							>Company</th
						>
						<th
							class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
							>Status</th
						>
						<th
							class="h-12 px-4 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
							>Action</th
						>
					</tr>
				</thead>
				<tbody class="[&_tr:last-child]:border-0">
					{#if loading}
						<tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
							<td colspan="5" class="h-24 p-4 text-center align-middle">Loading...</td>
						</tr>
					{:else if filteredContacts.length === 0}
						<tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
							<td colspan="5" class="h-24 p-4 text-center align-middle">No results.</td>
						</tr>
					{:else}
						{#each filteredContacts as contact (contact.id)}
							<tr
								class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
							>
								<td class="p-4 align-middle">
									{contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : '-'}
								</td>
								<td class="p-4 align-middle">
									<div class="flex flex-col">
										<span class="font-medium">{contact.name}</span>
										<span class="text-xs text-muted-foreground">{contact.email}</span>
									</div>
								</td>
								<td class="p-4 align-middle">{contact.company || '-'}</td>
								<td class="p-4 align-middle">
									<span class={getStatusClass(contact.status)}>{contact.status}</span>
								</td>
								<td class="p-4 text-right align-middle">
									<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
									<a href="{base}/admin/contacts/{contact.id}" class="text-primary hover:underline"
										>View</a
									>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

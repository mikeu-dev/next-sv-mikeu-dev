<script lang="ts">
	import { onMount } from 'svelte';
	import type { Contact } from '$lib/types';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import { toast } from 'svelte-sonner';

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

	function getStatusColor(status?: string) {
		switch (status) {
			case 'new':
				return 'bg-blue-500 hover:bg-blue-600';
			case 'in-review':
				return 'bg-yellow-500 hover:bg-yellow-600';
			case 'replied':
				return 'bg-green-500 hover:bg-green-600';
			case 'closed':
				return 'bg-gray-500 hover:bg-gray-600';
			default:
				return 'bg-blue-500';
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
		<Button variant="outline" on:click={() => window.location.reload()}>Refresh</Button>
	</div>

	<div class="flex items-center py-4">
		<Input placeholder="Filter emails..." class="max-w-sm" bind:value={searchQuery} />
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Date</Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head>Company</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head class="text-right">Action</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if loading}
					<Table.Row>
						<Table.Cell colspan={5} class="h-24 text-center">Loading...</Table.Cell>
					</Table.Row>
				{:else if filteredContacts.length === 0}
					<Table.Row>
						<Table.Cell colspan={5} class="h-24 text-center">No results.</Table.Cell>
					</Table.Row>
				{:else}
					{#each filteredContacts as contact (contact.id)}
						<Table.Row>
							<Table.Cell>
								{new Date(contact.createdAt).toLocaleDateString()}
							</Table.Cell>
							<Table.Cell>
								<div class="flex flex-col">
									<span class="font-medium">{contact.name}</span>
									<span class="text-xs text-muted-foreground">{contact.email}</span>
								</div>
							</Table.Cell>
							<Table.Cell>{contact.company || '-'}</Table.Cell>
							<Table.Cell>
								<Badge class={getStatusColor(contact.status)}>{contact.status}</Badge>
							</Table.Cell>
							<Table.Cell class="text-right">
								<a href="/admin/contacts/{contact.id}" class="text-primary hover:underline">View</a>
							</Table.Cell>
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>
</div>

<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { Contact } from '$lib/types';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	let contact: Contact | null = null;
	let loading = true;
	let saving = false;

	// Local state for form
	let status: string = 'new';
	let notes: string = '';

	const id = $page.params.id;

	onMount(async () => {
		try {
			const res = await fetch(`/api/admin/contacts/${id}`);
			if (res.ok) {
				const data = await res.json();
				contact = data.contact;
				if (contact) {
					status = contact.status || 'new';
					notes = contact.notes || '';
				}
			} else {
				toast.error('Failed to load contact');
			}
		} catch (e) {
			console.error(e);
			toast.error('Error loading contact');
		} finally {
			loading = false;
		}
	});

	async function handleSave() {
		saving = true;
		try {
			const res = await fetch('/api/admin/contacts', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id, status, notes })
			});

			if (res.ok) {
				toast.success('Contact updated');
				if (contact) {
					contact.status = status as any;
					contact.notes = notes;
				}
			} else {
				toast.error('Failed to update contact');
			}
		} catch (e) {
			console.error(e);
			toast.error('Error updating contact');
		} finally {
			saving = false;
		}
	}

	const statusOptions = [
		{ value: 'new', label: 'New' },
		{ value: 'in-review', label: 'In Review' },
		{ value: 'replied', label: 'Replied' },
		{ value: 'closed', label: 'Closed' }
	];
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-4">
			<Button variant="ghost" size="sm" onclick={() => goto('/admin/contacts')}>&larr; Back</Button>
			<h2 class="text-3xl font-bold tracking-tight">Contact Details</h2>
		</div>
	</div>

	{#if loading}
		<p>Loading...</p>
	{:else if !contact}
		<p>Contact not found.</p>
	{:else}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			<!-- Left Column: Contact Info -->
			<div class="space-y-6 md:col-span-2">
				<Card.Root>
					<Card.Header>
						<Card.Title>Message</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-4">
						<div class="grid grid-cols-2 gap-4">
							<div>
								<Label>Name</Label>
								<div class="text-lg font-medium">{contact.name}</div>
							</div>
							<div>
								<Label>Email</Label>
								<div class="text-lg font-medium">{contact.email}</div>
							</div>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<Label>Company</Label>
								<div class="text-base">{contact.company || '-'}</div>
							</div>
							<div>
								<Label>Budget</Label>
								<div class="text-base">{contact.budget || '-'}</div>
							</div>
						</div>
						<div>
							<Label>Message</Label>
							<div class="mt-2 rounded-md bg-muted p-4 whitespace-pre-wrap">{contact.message}</div>
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<!-- Right Column: Actions -->
			<div class="space-y-6">
				<Card.Root>
					<Card.Header>
						<Card.Title>Management</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-4">
						<div class="space-y-2">
							<Label>Status</Label>
							<select
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
								bind:value={status}
							>
								{#each statusOptions as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
						</div>
						<div class="space-y-2">
							<Label>Internal Notes</Label>
							<Textarea bind:value={notes} placeholder="Add notes here..." rows={6} />
						</div>
						<Button class="w-full" onclick={handleSave} disabled={saving}>
							{saving ? 'Saving...' : 'Save Changes'}
						</Button>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	{/if}
</div>

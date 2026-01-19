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
	// Local state for form
	let status: string = 'new';
	let notes: string = '';
	let tags: string[] = [];
	let newTag: string = '';

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
					tags = contact.tags || [];
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
				body: JSON.stringify({ id, status, notes, tags })
			});

			if (res.ok) {
				toast.success('Contact updated');
				if (contact) {
					contact.status = status as any;
					contact.notes = notes;
					contact.tags = tags;
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

	function addTag() {
		if (newTag.trim() && !tags.includes(newTag.trim())) {
			tags = [...tags, newTag.trim()];
			newTag = '';
		}
	}

	function removeTag(tag: string) {
		tags = tags.filter((t) => t !== tag);
	}

	function handleReply() {
		if (!contact?.email) return;
		const subject = encodeURIComponent(`Re: Project Inquiry - ${contact.company || contact.name}`);
		const body = encodeURIComponent(
			`Hi ${contact.name},\n\nThanks for reaching out regarding your project.\n\nBest regards,`
		);
		window.open(`mailto:${contact.email}?subject=${subject}&body=${body}`);
	}
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
								<div class="flex items-center gap-2">
									<div class="text-lg font-medium">{contact.email}</div>
									<Button
										variant="secondary"
										size="sm"
										class="h-6 px-2 text-xs"
										onclick={handleReply}
									>
										Reply
									</Button>
								</div>
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

			<!-- Activity Timeline -->
			<div class="space-y-6">
				<Card.Root>
					<Card.Header>
						<Card.Title>Management</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-4">
						<div class="space-y-2">
							<Label>Status</Label>
							<Select.Root type="single" bind:value={status}>
								<Select.Trigger class="w-full">
									{statusOptions.find((o) => o.value === status)?.label ?? 'Select status'}
								</Select.Trigger>
								<Select.Content>
									{#each statusOptions as option}
										<Select.Item value={option.value} label={option.label} />
									{/each}
								</Select.Content>
							</Select.Root>
						</div>

						<div class="space-y-2">
							<Label>Tags</Label>
							<div class="flex flex-wrap gap-2">
								{#each tags as tag}
									<span
										class="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/80"
									>
										{tag}
										<button
											class="ml-1 text-muted-foreground hover:text-foreground"
											onclick={() => removeTag(tag)}>&times;</button
										>
									</span>
								{/each}
							</div>
							<div class="flex gap-2">
								<Input
									type="text"
									placeholder="Add tag..."
									bind:value={newTag}
									onkeydown={(e) => e.key === 'Enter' && addTag()}
								/>
								<Button variant="outline" size="icon" onclick={addTag}>
									<span class="sr-only">Add</span>
									+
								</Button>
							</div>
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

				<Card.Root>
					<Card.Header>
						<Card.Title>Activity Log</Card.Title>
					</Card.Header>
					<Card.Content>
						{#if contact.logs && contact.logs.length > 0}
							<div class="space-y-4">
								{#each contact.logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as log}
									<div class="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
										<div class="flex items-center justify-between">
											<span class="text-sm font-semibold">{log.title}</span>
											<span class="text-xs text-muted-foreground">
												{new Date(log.createdAt).toLocaleString()}
											</span>
										</div>
										<p class="text-xs text-muted-foreground">{log.description}</p>
										{#if log.author}
											<div class="text-[10px] tracking-wider text-muted-foreground uppercase">
												By {log.author}
											</div>
										{/if}
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-sm text-muted-foreground">No activity recorded yet.</p>
						{/if}
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	{/if}
</div>

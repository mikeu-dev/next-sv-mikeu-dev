<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import type { GeneralSettings } from '$lib/server/schemas/settings.schema';

	let { data, form } = $props<{
		data: GeneralSettings;
		form?: any;
	}>();

	let loading = $state(false);
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">General Settings</h3>
		<p class="text-sm text-muted-foreground">Manage your general application settings here.</p>
	</div>
	<Separator />

	<form
		method="POST"
		action="?/saveGeneral"
		class="space-y-4"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				await update();
				loading = false;
			};
		}}
	>
		{#if form?.type === 'general' && form?.message}
			<div class={form.success ? 'text-green-600' : 'text-red-600'}>
				{form.message}
			</div>
		{/if}

		<div class="grid gap-2">
			<Label for="siteName">Site Name</Label>
			<Input
				id="siteName"
				name="siteName"
				placeholder="My Portfolio"
				value={form?.data?.siteName ?? data.siteName}
			/>
			{#if form?.type === 'general' && form?.errors?.siteName}
				<p class="text-sm text-red-500">{form.errors.siteName[0]}</p>
			{/if}
		</div>

		<div class="grid gap-2">
			<Label for="siteUrl">Site URL</Label>
			<Input
				id="siteUrl"
				name="siteUrl"
				placeholder="https://example.com"
				value={form?.data?.siteUrl ?? data.siteUrl}
			/>
			{#if form?.type === 'general' && form?.errors?.siteUrl}
				<p class="text-sm text-red-500">{form.errors.siteUrl[0]}</p>
			{/if}
		</div>

		<Button type="submit" disabled={loading}>
			{loading ? 'Saving...' : 'Save Changes'}
		</Button>
	</form>
</div>

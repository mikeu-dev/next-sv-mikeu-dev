<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { ProfileSettings } from '$lib/server/schemas/settings.schema';

	type FormState = {
		type?: string;
		message?: string;
		success?: boolean;
		data?: { username?: string; bio?: string };
		errors?: { username?: string[]; bio?: string[] };
	};

	let { data, form } = $props<{
		data: ProfileSettings;
		form?: FormState;
	}>();

	let loading = $state(false);
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Profile</h3>
		<p class="text-sm text-muted-foreground">This is how others will see you on the site.</p>
	</div>
	<Separator />

	<form
		method="POST"
		action="?/saveProfile"
		class="space-y-4"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				await update();
				loading = false;
			};
		}}
	>
		{#if form?.type === 'profile' && form?.message}
			<div class={form.success ? 'text-green-600' : 'text-red-600'}>
				{form.message}
			</div>
		{/if}

		<div class="grid gap-2">
			<Label for="username">Username</Label>
			<Input
				id="username"
				name="username"
				placeholder="johndoe"
				value={form?.data?.username ?? data.username}
			/>
			{#if form?.type === 'profile' && form?.errors?.username}
				<p class="text-sm text-red-500">{form.errors.username[0]}</p>
			{/if}
		</div>

		<div class="grid gap-2">
			<Label for="bio">Bio</Label>
			<Textarea
				id="bio"
				name="bio"
				placeholder="Tell us a little bit about yourself"
				value={form?.data?.bio ?? data.bio}
			/>
			{#if form?.type === 'profile' && form?.errors?.bio}
				<p class="text-sm text-red-500">{form.errors.bio[0]}</p>
			{/if}
		</div>

		<Button type="submit" disabled={loading}>
			{loading ? 'Saving...' : 'Save Profile'}
		</Button>
	</form>
</div>

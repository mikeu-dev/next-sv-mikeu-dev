<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import GeneralSettings from '$lib/components/admin/settings/GeneralSettings.svelte';
	import ProfileSettings from '$lib/components/admin/settings/ProfileSettings.svelte';
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-2xl font-bold tracking-tight">Settings</h3>
		<p class="text-muted-foreground">Manage your account settings and set e-mail preferences.</p>
	</div>
	<Tabs.Root value="general" class="space-y-4">
		<Tabs.List>
			<Tabs.Trigger value="general">General</Tabs.Trigger>
			<Tabs.Trigger value="profile">Profile</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="general" class="space-y-4">
			<GeneralSettings />
		</Tabs.Content>
		<Tabs.Content value="profile" class="space-y-4">
			<ProfileSettings />
		</Tabs.Content>
	</Tabs.Root>
</div>

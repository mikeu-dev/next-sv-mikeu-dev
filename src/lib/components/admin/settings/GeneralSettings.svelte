<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">General Settings</h3>
		<p class="text-sm text-muted-foreground">Manage your general application settings here.</p>
	</div>
	<Separator />
	<div class="space-y-4">
		<div class="grid gap-2">
			<Label for="site-name">Site Name</Label>
			<Input id="site-name" placeholder="My Portfolio" value="Next SV Portfolio" />
		</div>
		<div class="grid gap-2">
			<Label for="site-url">Site URL</Label>
			<Input id="site-url" placeholder="https://example.com" value="https://mysite.com" />
		</div>
		<Button>Save Changes</Button>
	</div>
</div>

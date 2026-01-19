<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { Textarea } from '$lib/components/ui/textarea';
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Profile</h3>
		<p class="text-sm text-muted-foreground">This is how others will see you on the site.</p>
	</div>
	<Separator />
	<div class="space-y-4">
		<div class="grid gap-2">
			<Label for="username">Username</Label>
			<Input id="username" placeholder="johndoe" value="mikeudev" />
		</div>
		<div class="grid gap-2">
			<Label for="bio">Bio</Label>
			<Textarea id="bio" placeholder="Tell us a little bit about yourself" />
		</div>
		<Button>Save Profile</Button>
	</div>
</div>

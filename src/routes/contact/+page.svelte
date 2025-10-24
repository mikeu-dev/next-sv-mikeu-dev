<script lang="ts">
	import Button from '@/lib/components/ui/button/button.svelte';
	import Input from '@/lib/components/ui/input/input.svelte';
	import Label from '@/lib/components/ui/label/label.svelte';
	import Textarea from '@/lib/components/ui/textarea/textarea.svelte';
	import { applyAction, enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	type ActionData = {
		success: boolean;
		message: string;
	};
</script>

<div class="space-y-12">
	<section class="text-center">
		<h1 class="font-poppins text-4xl font-bold tracking-tight md:text-5xl">Contact Me</h1>
		<p class="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
			I'm always open to discussing new projects, creative ideas, or opportunities to be part of
			your visions.
		</p>
	</section>

	<section class="mx-auto max-w-2xl">
		<form
			method="POST"
			use:enhance={({ formElement }) => {
				return async ({ result }) => {
					if (result.type === 'success') {
						const data = result.data as ActionData;
						toast.success(data.message);
						formElement.reset();
					} else if (result.type === 'failure') {
						const data = result.data as ActionData;
						toast.error(data.message ?? 'An unexpected error occurred.');
					}
					await applyAction(result);
				};
			}}
			class="space-y-6"
		>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div class="flex w-full max-w-sm flex-col gap-1.5">
					<Label for="name">Name</Label>
					<Input type="text" id="name" placeholder="Input name here" name="name" required />
					<p class="text-sm text-muted-foreground">Enter your name.</p>
				</div>
				<div class="flex w-full max-w-sm flex-col gap-1.5">
					<Label for="email">Email</Label>
					<Input type="email" id="email" name="email" placeholder="Input email here" required />
					<p class="text-sm text-muted-foreground">Enter your email address.</p>
				</div>
			</div>
			<div class="flex w-full max-w-2xl flex-col gap-1.5">
				<Label for="message">Message</Label>
				<Textarea id="message" name="message" rows={5} placeholder="Input message here" required />
				<p class="text-sm text-muted-foreground">Enter your message..</p>
			</div>
			<div class="text-right">
				<Button type="submit">Send Message</Button>
			</div>
		</form>
	</section>
</div>

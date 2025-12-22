<script lang="ts">
	import Button from '@/lib/components/ui/button/button.svelte';
	import Input from '@/lib/components/ui/input/input.svelte';
	import Label from '@/lib/components/ui/label/label.svelte';
	import Textarea from '@/lib/components/ui/textarea/textarea.svelte';
	import { applyAction, enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import * as m from '@/lib/paraglide/messages';

	type ActionData = {
		success: boolean;
		message: string;
	};
</script>

<div class="mt-20 space-y-12">
	<section class="text-center">
		<h1 class="font-poppins text-4xl font-bold tracking-tight md:text-5xl">
			{m.contact_page_title()}
		</h1>
		<p class="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
			{m.contact_page_subtitle()}
		</p>
	</section>

	<section class="mx-auto max-w-2xl">
		<form
			method="POST"
			use:enhance={({ formElement }) => {
				return async ({ result }) => {
					if (result.type === 'success') {
						const data = result.data as ActionData;
						toast.success(data.message ?? m.contact_form_success());
						formElement.reset();
					} else if (result.type === 'failure') {
						const data = result.data as ActionData;
						toast.error(data.message ?? m.contact_form_failure());
					}
					await applyAction(result);
				};
			}}
			class="space-y-6"
		>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div class="flex w-full max-w-sm flex-col gap-1.5">
					<Label for="name">{m.contact_field_name()}</Label>
					<Input
						type="text"
						id="name"
						placeholder={m.contact_field_placeholder({
							name: m.contact_field_name()
						})}
						name="name"
						required
					/>
					<p class="text-sm text-muted-foreground">
						{m.contact_field_decription({
							name: m.contact_field_name()
						})}
					</p>
				</div>
				<div class="flex w-full max-w-sm flex-col gap-1.5">
					<Label for="email">{m.contact_field_email()}</Label>
					<Input
						type="email"
						id="email"
						name="email"
						placeholder={m.contact_field_placeholder({
							name: m.contact_field_email()
						})}
						required
					/>
					<p class="text-sm text-muted-foreground">
						{m.contact_field_decription({
							name: m.contact_field_email()
						})}
					</p>
				</div>
			</div>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div class="flex w-full max-w-sm flex-col gap-1.5">
					<Label for="company">Company</Label>
					<Input type="text" id="company" name="company" placeholder="Your Company Name" />
					<p class="text-sm text-muted-foreground">Optional</p>
				</div>
				<div class="flex w-full max-w-sm flex-col gap-1.5">
					<Label for="budget">Budget</Label>
					<Input type="text" id="budget" name="budget" placeholder="e.g. $1,000 - $5,000" />
					<p class="text-sm text-muted-foreground">Estimate budget for the project</p>
				</div>
			</div>
			<div class="flex w-full max-w-2xl flex-col gap-1.5">
				<Label for="message">{m.contact_field_message()}</Label>
				<Textarea
					id="message"
					name="message"
					rows={5}
					placeholder={m.contact_field_placeholder({
						name: m.contact_field_message()
					})}
					required
				/>
				<p class="text-sm text-muted-foreground">
					{m.contact_field_decription({
						name: m.contact_field_message()
					})}
				</p>
			</div>
			<div class="text-right">
				<Button type="submit">{m.contact_page_button()}</Button>
			</div>
		</form>
	</section>
</div>

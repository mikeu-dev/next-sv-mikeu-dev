<script lang="ts">
	import Button from '@/lib/components/ui/button/button.svelte';
	import Input from '@/lib/components/ui/input/input.svelte';
	import Label from '@/lib/components/ui/label/label.svelte';
	import Textarea from '@/lib/components/ui/textarea/textarea.svelte';
	import { applyAction, enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import * as m from '@/lib/paraglide/messages';
	import { ConfettiCannon } from 'svelte-canvas-confetti';
	import { playConfettiSound } from '$lib/utils/confetti-sound';
	import { tick } from 'svelte';

	type ActionData = {
		success: boolean;
		message: string;
	};

	let confettiCannon = $state(false);

	const triggerConfetti = async () => {
		confettiCannon = false;
		await tick();
		confettiCannon = true;
		playConfettiSound();
	};
</script>

{#if confettiCannon}
	<ConfettiCannon
		origin={[window.innerWidth / 2, window.innerHeight]}
		angle={-90}
		spread={35}
		force={35}
	/>
{/if}

<div class="mt-28 space-y-12">
	<section class="text-center">
		<h1 class="font-poppins text-4xl font-black tracking-tight md:text-6xl">
			{m.contact_page_title()}<span class="text-primary">.</span>
		</h1>
		<p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
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
						await triggerConfetti();
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
					<Label for="company">{m.contact_field_company()}</Label>
					<Input
						type="text"
						id="company"
						name="company"
						placeholder={m.contact_field_company_placeholder()}
					/>
					<p class="text-sm text-muted-foreground">{m.contact_field_optional()}</p>
				</div>
				<div class="flex w-full max-w-sm flex-col gap-1.5">
					<Label for="budget">{m.contact_field_budget()}</Label>
					<Input
						type="text"
						id="budget"
						name="budget"
						placeholder={m.contact_field_budget_placeholder()}
					/>
					<p class="text-sm text-muted-foreground">{m.contact_field_budget_description()}</p>
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

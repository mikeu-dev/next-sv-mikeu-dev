<script lang="ts">
	import { cn } from '$lib/utils';

	type Props = {
		class?: string;
		animate?: boolean;
	};

	let { class: className, animate = true }: Props = $props();
</script>

<div class={cn('rounded-md bg-muted', animate && 'animate-pulse', className)}></div>

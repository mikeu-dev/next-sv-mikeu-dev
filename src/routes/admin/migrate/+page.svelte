<script lang="ts">
	import { toast } from 'svelte-sonner';

	let migrating = $state(false);
	let results = $state<any[]>([]);

	async function runMigration() {
		if (!confirm('Are you sure you want to migrate all local data to Firestore?')) return;

		migrating = true;
		results = [];

		try {
			const response = await fetch('/api/migrate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'migrate-all' })
			});

			const data = await response.json();

			if (response.ok) {
				results = data.results;
				toast.success('Migration completed!');
			} else {
				toast.error(data.error || 'Migration failed');
			}
		} catch (error: any) {
			toast.error(error.message || 'Migration failed');
		} finally {
			migrating = false;
		}
	}
</script>

<div class="container mx-auto max-w-4xl p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">Data Migration</h1>
		<p class="text-muted-foreground">Migrate local data to Firestore</p>
	</div>

	<div class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
		<h2 class="mb-4 text-xl font-semibold">Collections to Migrate:</h2>
		<ul class="mb-6 space-y-2">
			<li class="flex items-center gap-2">
				<span class="text-2xl">📚</span>
				<span>TechStack (EN & ID)</span>
			</li>
			<li class="flex items-center gap-2">
				<span class="text-2xl">🚀</span>
				<span>Journey (EN & ID)</span>
			</li>
			<li class="flex items-center gap-2">
				<span class="text-2xl">💪</span>
				<span>Skills (EN & ID)</span>
			</li>
			<li class="flex items-center gap-2">
				<span class="text-2xl">🔗</span>
				<span>Social Links</span>
			</li>
			<li class="flex items-center gap-2">
				<span class="text-2xl">📁</span>
				<span>Projects (EN & ID)</span>
			</li>
		</ul>

		<button
			onclick={runMigration}
			disabled={migrating}
			class="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
		>
			{migrating ? 'Migrating...' : 'Start Migration'}
		</button>

		{#if results.length > 0}
			<div class="mt-6">
				<h3 class="mb-3 text-lg font-semibold">Migration Results:</h3>
				<div class="space-y-2">
					{#each results as result}
						<div
							class="flex items-center justify-between rounded-lg border p-3 {result.status ===
							'success'
								? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950'
								: 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'}"
						>
							<span class="font-medium capitalize">{result.collection}</span>
							<span
								class="text-sm {result.status === 'success' ? 'text-green-600' : 'text-red-600'}"
							>
								{result.status === 'success' ? '✅ Success' : '❌ ' + result.message}
							</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

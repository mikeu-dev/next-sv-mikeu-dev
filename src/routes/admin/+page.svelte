<script lang="ts">
	import { goto } from '$app/navigation';
</script>

<div class="container mx-auto p-6">
	<div class="mb-8">
		<h1 class="text-4xl font-bold">Portfolio CRM</h1>
		<p class="text-muted-foreground">Manage your portfolio content</p>
	</div>

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		<!-- Projects -->
		<button
			onclick={() => goto('/admin/projects')}
			class="group rounded-lg border border-gray-200 bg-white p-6 text-left transition-all hover:border-blue-500 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
		>
			<div
				class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900"
			>
				<span class="text-2xl">📁</span>
			</div>
			<h2 class="mb-2 text-xl font-semibold group-hover:text-blue-600">Projects</h2>
			<p class="text-sm text-muted-foreground">Manage your portfolio projects</p>
		</button>

		<!-- TechStack -->
		<button
			onclick={() => goto('/admin/techstack')}
			class="group rounded-lg border border-gray-200 bg-white p-6 text-left transition-all hover:border-purple-500 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
		>
			<div
				class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900"
			>
				<span class="text-2xl">📚</span>
			</div>
			<h2 class="mb-2 text-xl font-semibold group-hover:text-purple-600">TechStack</h2>
			<p class="text-sm text-muted-foreground">Manage your technology stack</p>
		</button>

		<!-- Journey -->
		<button
			onclick={() => goto('/admin/journey')}
			class="group rounded-lg border border-gray-200 bg-white p-6 text-left transition-all hover:border-green-500 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
		>
			<div
				class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900"
			>
				<span class="text-2xl">🚀</span>
			</div>
			<h2 class="mb-2 text-xl font-semibold group-hover:text-green-600">Journey</h2>
			<p class="text-sm text-muted-foreground">Manage your career timeline</p>
		</button>

		<!-- Skills -->
		<button
			onclick={() => goto('/admin/skills')}
			class="group rounded-lg border border-gray-200 bg-white p-6 text-left transition-all hover:border-orange-500 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
		>
			<div
				class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900"
			>
				<span class="text-2xl">💪</span>
			</div>
			<h2 class="mb-2 text-xl font-semibold group-hover:text-orange-600">Skills</h2>
			<p class="text-sm text-muted-foreground">Manage your skills list</p>
		</button>

		<!-- Socials -->
		<button
			onclick={() => goto('/admin/socials')}
			class="group rounded-lg border border-gray-200 bg-white p-6 text-left transition-all hover:border-pink-500 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
		>
			<div
				class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900"
			>
				<span class="text-2xl">🔗</span>
			</div>
			<h2 class="mb-2 text-xl font-semibold group-hover:text-pink-600">Social Links</h2>
			<p class="text-sm text-muted-foreground">Manage your social media links</p>
		</button>

		<!-- Contacts -->
		<button
			onclick={() => goto('/admin/contacts')}
			class="group rounded-lg border border-gray-200 bg-white p-6 text-left transition-all hover:border-cyan-500 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
		>
			<div
				class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900"
			>
				<span class="text-2xl">📧</span>
			</div>
			<h2 class="mb-2 text-xl font-semibold group-hover:text-cyan-600">Contacts</h2>
			<p class="text-sm text-muted-foreground">View contact submissions</p>
		</button>
	</div>

	<!-- Migration Section -->
	<div
		class="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-900 dark:bg-yellow-950"
	>
		<div class="mb-4 flex items-center gap-3">
			<span class="text-3xl">⚙️</span>
			<div>
				<h3 class="text-lg font-semibold">Data Migration</h3>
				<p class="text-sm text-muted-foreground">Migrate local data to Firestore</p>
			</div>
		</div>
		<button
			onclick={() => goto('/admin/migrate')}
			class="rounded-lg bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
		>
			Go to Migration
		</button>
	</div>
</div>

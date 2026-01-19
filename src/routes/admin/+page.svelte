<script lang="ts">
	import {
		LayoutDashboard,
		FolderKanban,
		FileText,
		MessageSquare,
		Layers,
		ArrowRight,
		Plus,
		Hammer,
		Users
	} from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const stats = [
		{
			label: 'Total Projects',
			value: data.stats.projects,
			icon: FolderKanban,
			color: 'text-blue-600',
			bg: 'bg-blue-100 dark:bg-blue-900/20',
			href: '/admin/projects'
		},
		{
			label: 'Total Articles',
			value: data.stats.blogs,
			icon: FileText,
			color: 'text-green-600',
			bg: 'bg-green-100 dark:bg-green-900/20',
			href: '/admin/blog'
		},
		{
			label: 'Total Messages',
			value: data.stats.contacts,
			icon: MessageSquare,
			color: 'text-orange-600',
			bg: 'bg-orange-100 dark:bg-orange-900/20',
			href: '/admin/contacts'
		},
		{
			label: 'Tech Stack Items',
			value: data.stats.techstack,
			icon: Layers,
			color: 'text-purple-600',
			bg: 'bg-purple-100 dark:bg-purple-900/20',
			href: '/admin/techstack'
		},
		{
			label: 'Total Visitors',
			value: data.stats.visitors.total,
			icon: Users,
			color: 'text-pink-600',
			bg: 'bg-pink-100 dark:bg-pink-900/20',
			href: '#' // No specific page for now, or could link to detailed analytics later
		}
	];
</script>

<div class="space-y-8">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
			<p class="text-muted-foreground">Overview of your portfolio activity.</p>
		</div>
		<div class="flex gap-2">
			<button
				class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
				onclick={() => goto('/admin/projects/create')}
			>
				<Plus class="h-4 w-4" /> New Project
			</button>
			<button
				class="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
				onclick={() => goto('/admin/blog/create')}
			>
				<Plus class="h-4 w-4" /> New Post
			</button>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
		{#each stats as stat}
			<button
				class="relative overflow-hidden rounded-xl border bg-card p-6 text-left shadow-sm transition-all hover:shadow-md"
				onclick={() => goto(stat.href)}
			>
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-muted-foreground">{stat.label}</p>
						<p class="text-3xl font-bold">{stat.value}</p>
					</div>
					<div class={`rounded-full p-3 ${stat.bg} ${stat.color}`}>
						<stat.icon class="h-6 w-6" />
					</div>
				</div>
			</button>
		{/each}
	</div>

	<div class="grid gap-8 lg:grid-cols-3">
		<!-- Recent Activity (Messages) -->
		<div class="rounded-xl border bg-card shadow-sm lg:col-span-2">
			<div class="flex items-center justify-between border-b p-6">
				<div>
					<h2 class="text-lg font-semibold">Recent Inquiries</h2>
					<p class="text-sm text-muted-foreground">Latest messages from contact form</p>
				</div>
				<button
					class="text-sm font-medium text-primary hover:underline"
					onclick={() => goto('/admin/contacts')}
				>
					View all
				</button>
			</div>
			<div class="p-6">
				{#if data.recent.messages.length > 0}
					<div class="space-y-6">
						{#each data.recent.messages as msg}
							<div class="flex items-start justify-between">
								<div class="flex gap-4">
									<div
										class="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground"
									>
										{(msg.name || '?').charAt(0).toUpperCase()}
									</div>
									<div class="min-w-0 flex-1">
										<p class="truncate font-medium">{msg.name || 'Anonymous'}</p>
										<p class="line-clamp-1 text-sm break-all text-muted-foreground">
											{msg.message}
										</p>
										<div class="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
											<span>{msg.email}</span>
											<span>•</span>
											<span
												>{msg.createdAt
													? new Date(msg.createdAt).toLocaleDateString()
													: 'N/A'}</span
											>
										</div>
									</div>
								</div>
								<span
									class={`ml-2 inline-flex flex-shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
									${msg.status === 'new' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
									${msg.status === 'in-review' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
									${msg.status === 'replied' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                                    ${msg.status === 'closed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' : ''}
								`}
								>
									{msg.status || 'new'}
								</span>
							</div>
						{/each}
					</div>
				{:else}
					<div
						class="flex flex-col items-center justify-center py-8 text-center text-muted-foreground"
					>
						<MessageSquare class="mb-2 h-10 w-10 opacity-20" />
						<p>No messages yet</p>
					</div>
				{/if}
			</div>

			<!-- Recent Visitors -->
			<div class="mt-8 border-t pt-8">
				<div class="mb-4">
					<h2 class="text-lg font-semibold">Recent Visitors</h2>
					<p class="text-sm text-muted-foreground">Latest 10 visitors</p>
				</div>

				<div class="relative overflow-x-auto rounded-lg border">
					<table class="w-full text-left text-sm">
						<thead class="bg-muted/50 text-xs text-muted-foreground uppercase">
							<tr>
								<th class="px-4 py-3">Time</th>
								<th class="px-4 py-3">IP Address</th>
								<th class="px-4 py-3">Browser / OS</th>
								<th class="px-4 py-3">Device</th>
								<th class="px-4 py-3">Page</th>
							</tr>
						</thead>
						<tbody class="divide-y">
							{#each data.recent.visitors as visitor}
								<tr class="bg-card hover:bg-muted/50">
									<td class="px-4 py-3 whitespace-nowrap text-muted-foreground">
										{visitor.timestamp ? new Date(visitor.timestamp).toLocaleString() : 'N/A'}
									</td>
									<td class="px-4 py-3 font-medium">{visitor.ip || 'Unknown'}</td>
									<td class="px-4 py-3">
										<div class="flex flex-col">
											<span>{visitor.browser}</span>
											<span class="text-xs text-muted-foreground">{visitor.os}</span>
										</div>
									</td>
									<td class="px-4 py-3">{visitor.device}</td>
									<td
										class="max-w-[200px] truncate px-4 py-3 text-muted-foreground"
										title={visitor.path}>{visitor.path}</td
									>
								</tr>
							{:else}
								<tr>
									<td colspan="5" class="py-8 text-center text-muted-foreground">
										No visitor logs found.
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- Latest Posts & Quick Links -->
		<div class="space-y-8">
			<!-- Latest Posts -->
			<div class="rounded-xl border bg-card shadow-sm">
				<div class="flex items-center justify-between border-b p-6">
					<h2 class="text-lg font-semibold">Latest Articles</h2>
					<button
						class="text-sm font-medium text-primary hover:underline"
						onclick={() => goto('/admin/blog')}
					>
						View all
					</button>
				</div>
				<div class="p-6">
					{#if data.recent.posts.length > 0}
						<div class="space-y-6">
							{#each data.recent.posts as post}
								<a href={`/admin/blog/${post.id}`} class="group block">
									<p class="line-clamp-1 font-medium transition-colors group-hover:text-primary">
										{post.title}
									</p>
									<div class="mt-1 flex items-center justify-between">
										<span class="text-xs text-muted-foreground"
											>{post.date ? new Date(post.date).toLocaleDateString() : 'No date'}</span
										>
										<span
											class={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase 
											${post.published ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400' : 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-400'}`}
										>
											{post.published ? 'Published' : 'Draft'}
										</span>
									</div>
								</a>
							{/each}
						</div>
					{:else}
						<p class="py-4 text-center text-sm text-muted-foreground">No articles published yet.</p>
					{/if}
				</div>
			</div>

			<!-- Skills Shortcut -->
			<div class="rounded-xl border bg-card shadow-sm">
				<div class="p-6">
					<h3 class="mb-2 flex items-center gap-2 font-semibold">
						<Hammer class="h-4 w-4" /> Skills
					</h3>
					<div class="space-y-2">
						<button
							class="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
							onclick={() => goto('/admin/skills')}
						>
							<span>Manage Skills</span>
							<span class="text-xs text-muted-foreground">{data.stats.skills} skills</span>
							<ArrowRight
								class="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100"
							/>
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

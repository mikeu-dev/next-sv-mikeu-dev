<script lang="ts">
	import { toast } from 'svelte-sonner';
	import MarkdownEditor from '$lib/components/admin/markdown-editor.svelte';
	import { goto } from '$app/navigation';

	interface BlogPost {
		id?: string;
		slug: string;
		locale: string;
		title: string;
		description: string;
		date: string;
		published: boolean;
		content: string;
	}

	let { initialData = null, isEditing = false } = $props<{
		initialData?: BlogPost | null;
		isEditing?: boolean;
	}>();

	// Unified Form Data Storage
	let commonData = $state({
		slug: initialData?.slug || '',
		date: initialData?.date || new Date().toISOString().split('T')[0],
		published: initialData?.published || false // Global publish switch? Or per lang? Let's make it per lang effectively, or shared?
		// User request "Create post" implies both.
		// Usually publish status might differ (e.g. translate later).
		// Let's keep published separated per locale in UI, OR shared?
		// Simplicity: Shared for now? Or separated?
		// Let's try Separated "Published" status per language to allow draft translation.
	});

	// Content specific to locales
	let contentData = $state<
		Record<string, { title: string; description: string; content: string; published: boolean }>
	>({
		en: {
			title: initialData?.locale === 'en' ? initialData?.title || '' : '',
			description: initialData?.locale === 'en' ? initialData?.description || '' : '',
			content: initialData?.locale === 'en' ? initialData?.content || '' : '',
			published: initialData?.locale === 'en' ? initialData?.published || false : false
		},
		id: {
			title: initialData?.locale === 'id' ? initialData?.title || '' : '',
			description: initialData?.locale === 'id' ? initialData?.description || '' : '',
			content: initialData?.locale === 'id' ? initialData?.content || '' : '',
			published: initialData?.locale === 'id' ? initialData?.published || false : false
		}
	});

	let activeTab = $state<'en' | 'id'>((initialData?.locale as 'en' | 'id') || 'en');
	let loading = $state(false);

	// If editing, we might need to fetch the OTHER language data if it wasn't passed in initialData
	// ideally the parent loads BOTH. But parent currently loads ONE.
	// Let's implement lazy fetch for the other language on mount if we have a slug.
	import { onMount } from 'svelte';

	onMount(async () => {
		if (isEditing && commonData.slug) {
			// Fetch ALL variants with this slug
			try {
				// Fetch other locale data
				const otherLocale = initialData?.locale === 'en' ? 'id' : 'en';
				const res = await fetch(`/api/admin/blog?slug=${commonData.slug}&locale=${otherLocale}`);
				if (res.ok) {
					const otherData = await res.json();
					contentData[otherLocale] = {
						title: otherData.title,
						description: otherData.description,
						content: otherData.content,
						published: otherData.published
					};
				} else {
					// Other locale not found, status: res.status
				}
			} catch (e) {
				console.error('Failed to load other language version', e);
			}
		}
	});

	function generateSlug() {
		// Only generate if empty/new and user is typing in the active tab title
		if (isEditing) return;
		const currentTitle = contentData[activeTab].title;
		if (!currentTitle) return;

		commonData.slug = currentTitle
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}

	async function handleSubmit() {
		// Validation: title required for at least ONE language?
		// Or specific language?
		// If user is working on EN, EN title required.
		// If user fills ID, ID title required.

		let promises = [];
		loading = true;

		try {
			// Save EN
			if (contentData.en.title) {
				const enData = {
					...contentData.en,
					slug: commonData.slug,
					date: commonData.date,
					locale: 'en'
				};
				// Id strategy: slug-locale
				// const id = `${commonData.slug}-en`; // ID is now handled by the API based on slug and locale
				// Determine method: If isEditing, we assume update, but actually we should use set (upsert) to be safe?
				// The API supports POST (create) and PUT (update).
				// `createPost` uses set. `updatePost` uses update.
				// Safest is to use POST for upsert-like behavior if clean, or check existence?
				// Let's use POST logic which does SET (overwrite/create).
				// But wait, API POST checks for slug uniqueness? No, service uses set.
				// So POST is essentially "Save".
				promises.push(
					fetch('/api/admin/blog', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(enData)
					})
				);
			}

			// Save ID
			if (contentData.id.title) {
				const idData = {
					...contentData.id,
					slug: commonData.slug,
					date: commonData.date,
					locale: 'id'
				};
				promises.push(
					fetch('/api/admin/blog', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(idData)
					})
				);
			}

			if (promises.length === 0) {
				toast.error('Please add content for at least one language');
				loading = false;
				return;
			}

			await Promise.all(promises);
			toast.success('Changes saved successfully');
			goto('/admin/blog');
		} catch (e: any) {
			console.error(e);
			toast.error('Failed to save');
		} finally {
			loading = false;
		}
	}
</script>

<div class="space-y-6">
	<!-- Shared Fields -->
	<div class="grid gap-6 md:grid-cols-2">
		<!-- Main Info -->
		<div class="space-y-4">
			<!-- Slug (Global) -->
			<div>
				<label for="slug" class="mb-1 block text-sm font-medium">Slug (URL)</label>
				<div class="flex">
					<input
						type="text"
						id="slug"
						bind:value={commonData.slug}
						class="w-full flex-1 rounded-l-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
						placeholder="url-slug"
					/>
					<button
						type="button"
						onclick={generateSlug}
						class="rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
						title="Regenerate slug from current title"
					>
						🔄
					</button>
				</div>
				<p class="mt-1 text-xs text-muted-foreground">Shared between languages</p>
			</div>

			<!-- Date (Global) -->
			<div>
				<label for="date" class="mb-1 block text-sm font-medium">Date</label>
				<input
					type="date"
					id="date"
					bind:value={commonData.date}
					class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
				/>
			</div>
		</div>
	</div>

	<hr class="border-gray-200 dark:border-gray-800" />

	<!-- Language Tabs -->
	<div class="flex gap-2 border-b border-gray-300 dark:border-gray-700">
		<button
			type="button"
			onclick={() => (activeTab = 'en')}
			class="px-4 py-2 font-medium transition-colors {activeTab === 'en'
				? 'border-b-2 border-blue-600 text-blue-600'
				: 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}"
		>
			🇬🇧 English
		</button>
		<button
			type="button"
			onclick={() => (activeTab = 'id')}
			class="px-4 py-2 font-medium transition-colors {activeTab === 'id'
				? 'border-b-2 border-blue-600 text-blue-600'
				: 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}"
		>
			🇮🇩 Indonesia
		</button>
	</div>

	<!-- Localized Fields -->
	<div class="space-y-6">
		<div>
			<label for="title" class="mb-1 block text-sm font-medium"
				>Title ({activeTab.toUpperCase()})</label
			>
			<input
				type="text"
				id="title"
				bind:value={contentData[activeTab].title}
				oninput={generateSlug}
				class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
				placeholder="Enter post title"
			/>
		</div>

		<div>
			<label for="description" class="mb-1 block text-sm font-medium"
				>Description ({activeTab.toUpperCase()})</label
			>
			<textarea
				id="description"
				bind:value={contentData[activeTab].description}
				rows="3"
				class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
				placeholder="Short description for SEO and lists"
			></textarea>
		</div>

		<div class="flex items-center gap-2">
			<input
				type="checkbox"
				id="published"
				bind:checked={contentData[activeTab].published}
				class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
			/>
			<label for="published" class="text-sm font-medium">
				Publish ({activeTab.toUpperCase()} version)
			</label>
		</div>
	</div>

	<!-- Content Editor -->
	<div>
		<label for="content" class="mb-1 block text-sm font-medium"
			>Content ({activeTab.toUpperCase()})</label
		>
		{#key activeTab}
			<MarkdownEditor
				bind:value={contentData[activeTab].content}
				placeholder="Write your blog post content here..."
			/>
		{/key}
	</div>

	<!-- Actions -->
	<div
		class="flex items-center justify-end gap-4 border-t border-gray-200 pt-6 dark:border-gray-800"
	>
		<button
			type="button"
			onclick={() => goto('/admin/blog')}
			class="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
		>
			Cancel
		</button>
		<button
			type="button"
			onclick={handleSubmit}
			disabled={loading}
			class="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
		>
			{loading ? 'Saving...' : 'Save Post'}
		</button>
	</div>
</div>

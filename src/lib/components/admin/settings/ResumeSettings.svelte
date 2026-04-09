<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { toast } from 'svelte-sonner';
	import { Upload, FileText, ExternalLink, Trash2, CheckCircle, Loader2 } from '@lucide/svelte';
	import type { ResumeSettings } from '$lib/server/schemas/settings.schema';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props<{
		data: ResumeSettings;
	}>();

	let uploadingEn = $state(false);
	let uploadingId = $state(false);
	let dragOverEn = $state(false);
	let dragOverId = $state(false);

	let fileInputEn: HTMLInputElement;
	let fileInputId: HTMLInputElement;

	async function handleUpload(file: File, locale: 'en' | 'id') {
		if (file.type !== 'application/pdf') {
			toast.error('Only PDF files are allowed');
			return;
		}

		if (file.size > 10 * 1024 * 1024) {
			toast.error('File size exceeds 10MB limit');
			return;
		}

		if (locale === 'en') uploadingEn = true;
		else uploadingId = true;

		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('locale', locale);

			const response = await fetch('/api/resume/upload', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Upload failed');
			}

			toast.success(`Resume (${locale.toUpperCase()}) uploaded successfully!`);
			await invalidateAll();
		} catch (error) {
			toast.error(`Upload failed: ${(error as Error).message}`);
		} finally {
			if (locale === 'en') uploadingEn = false;
			else uploadingId = false;
		}
	}

	function handleFileSelect(event: Event, locale: 'en' | 'id') {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) handleUpload(file, locale);
		input.value = '';
	}

	function handleDrop(event: DragEvent, locale: 'en' | 'id') {
		event.preventDefault();
		if (locale === 'en') dragOverEn = false;
		else dragOverId = false;

		const file = event.dataTransfer?.files?.[0];
		if (file) handleUpload(file, locale);
	}

	function handleDragOver(event: DragEvent, locale: 'en' | 'id') {
		event.preventDefault();
		if (locale === 'en') dragOverEn = true;
		else dragOverId = true;
	}

	function handleDragLeave(locale: 'en' | 'id') {
		if (locale === 'en') dragOverEn = false;
		else dragOverId = false;
	}

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	function formatDate(dateStr: string): string {
		if (!dateStr) return 'Never';
		return new Date(dateStr).toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Resume / CV</h3>
		<p class="text-sm text-muted-foreground">
			Manage your resume files for each language. Upload PDF files that visitors can download.
		</p>
	</div>
	<Separator />

	{#if data.updatedAt}
		<div
			class="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
		>
			<CheckCircle class="h-4 w-4 shrink-0" />
			<span>Last updated: {formatDate(data.updatedAt)}</span>
		</div>
	{/if}

	<div class="grid gap-6 md:grid-cols-2">
		<!-- English Resume -->
		<div class="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
				>
					<span class="text-sm font-bold">EN</span>
				</div>
				<div>
					<h4 class="font-semibold">English Resume</h4>
					<p class="text-xs text-muted-foreground">PDF file for English locale</p>
				</div>
			</div>

			{#if data.resumeUrlEn}
				<div class="rounded-lg border border-border/50 bg-muted/30 p-4">
					<div class="flex items-start gap-3">
						<FileText class="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm font-medium">{data.resumeFileNameEn || 'resume-en.pdf'}</p>
							<a
								href={data.resumeUrlEn}
								target="_blank"
								rel="noopener noreferrer"
								class="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
							>
								<ExternalLink class="h-3 w-3" />
								Preview
							</a>
						</div>
					</div>
				</div>
			{/if}

			<!-- Upload Zone EN -->
			<div
				role="button"
				tabindex="0"
				class="relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all duration-200
					{dragOverEn
					? 'border-primary bg-primary/5 scale-[1.02]'
					: 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}"
				ondrop={(e) => handleDrop(e, 'en')}
				ondragover={(e) => handleDragOver(e, 'en')}
				ondragleave={() => handleDragLeave('en')}
				onclick={() => fileInputEn.click()}
				onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputEn.click(); }}
			>
				{#if uploadingEn}
					<div class="flex flex-col items-center gap-2">
						<Loader2 class="h-8 w-8 animate-spin text-primary" />
						<p class="text-sm font-medium text-primary">Uploading...</p>
					</div>
				{:else}
					<Upload class="mx-auto h-8 w-8 text-muted-foreground/50" />
					<p class="mt-2 text-sm font-medium text-muted-foreground">
						{data.resumeUrlEn ? 'Replace file' : 'Drop PDF here or click to upload'}
					</p>
					<p class="mt-1 text-xs text-muted-foreground/70">PDF only, max 10MB</p>
				{/if}
				<input
					bind:this={fileInputEn}
					type="file"
					accept=".pdf,application/pdf"
					class="hidden"
					onchange={(e) => handleFileSelect(e, 'en')}
				/>
			</div>
		</div>

		<!-- Indonesian Resume -->
		<div class="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
				>
					<span class="text-sm font-bold">ID</span>
				</div>
				<div>
					<h4 class="font-semibold">Resume Bahasa Indonesia</h4>
					<p class="text-xs text-muted-foreground">File PDF untuk locale Indonesia</p>
				</div>
			</div>

			{#if data.resumeUrlId}
				<div class="rounded-lg border border-border/50 bg-muted/30 p-4">
					<div class="flex items-start gap-3">
						<FileText class="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm font-medium">{data.resumeFileNameId || 'resume-id.pdf'}</p>
							<a
								href={data.resumeUrlId}
								target="_blank"
								rel="noopener noreferrer"
								class="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
							>
								<ExternalLink class="h-3 w-3" />
								Preview
							</a>
						</div>
					</div>
				</div>
			{/if}

			<!-- Upload Zone ID -->
			<div
				role="button"
				tabindex="0"
				class="relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all duration-200
					{dragOverId
					? 'border-primary bg-primary/5 scale-[1.02]'
					: 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}"
				ondrop={(e) => handleDrop(e, 'id')}
				ondragover={(e) => handleDragOver(e, 'id')}
				ondragleave={() => handleDragLeave('id')}
				onclick={() => fileInputId.click()}
				onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputId.click(); }}
			>
				{#if uploadingId}
					<div class="flex flex-col items-center gap-2">
						<Loader2 class="h-8 w-8 animate-spin text-primary" />
						<p class="text-sm font-medium text-primary">Uploading...</p>
					</div>
				{:else}
					<Upload class="mx-auto h-8 w-8 text-muted-foreground/50" />
					<p class="mt-2 text-sm font-medium text-muted-foreground">
						{data.resumeUrlId ? 'Replace file' : 'Drop PDF here or click to upload'}
					</p>
					<p class="mt-1 text-xs text-muted-foreground/70">PDF only, max 10MB</p>
				{/if}
				<input
					bind:this={fileInputId}
					type="file"
					accept=".pdf,application/pdf"
					class="hidden"
					onchange={(e) => handleFileSelect(e, 'id')}
				/>
			</div>
		</div>
	</div>
</div>

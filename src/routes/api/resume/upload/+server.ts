import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GitHubStorageService } from '$lib/server/services/github-storage.service';
import { settingsService } from '$lib/server/services/settings.service';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['application/pdf'];

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File | null;
		const locale = (formData.get('locale') as string) || 'en';

		if (!file || !(file instanceof File)) {
			return json({ error: 'No file uploaded' }, { status: 400 });
		}

		if (!ALLOWED_MIME_TYPES.includes(file.type)) {
			return json({ error: 'Only PDF files are allowed' }, { status: 400 });
		}

		if (file.size > MAX_FILE_SIZE) {
			return json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
		}

		if (!['en', 'id'].includes(locale)) {
			return json({ error: 'Invalid locale. Must be "en" or "id"' }, { status: 400 });
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Generate a clean filename
		const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
		const filename = `resume-${locale}-${cleanName}`;

		// Upload to GitHub
		const githubStorage = new GitHubStorageService();
		const url = await githubStorage.uploadResumeFile(buffer, filename, locale);

		// Update Firestore with the new resume URL
		const updateData: Record<string, string> = {};
		if (locale === 'en') {
			updateData.resumeUrlEn = url;
			updateData.resumeFileNameEn = file.name;
		} else {
			updateData.resumeUrlId = url;
			updateData.resumeFileNameId = file.name;
		}

		await settingsService.updateResumeSettings(updateData);

		return json({
			success: true,
			url,
			fileName: file.name,
			locale
		});
	} catch (error) {
		console.error('Resume upload error:', error);
		return json({ error: `Failed to upload resume: ${(error as Error).message}` }, { status: 500 });
	}
};

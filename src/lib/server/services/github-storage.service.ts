import { Octokit } from 'octokit';
import { GITHUB_ACCESS_TOKEN, GITHUB_USERNAME, GITHUB_REPO, GITHUB_BRANCH } from '$env/static/private';
import { HttpException } from '../exceptions/http.exception';

export class GitHubStorageService {
    private octokit: Octokit;
    private owner: string;
    private repo: string;
    private branch: string;

    constructor() {
        if (!GITHUB_ACCESS_TOKEN) {
            throw new Error('GITHUB_ACCESS_TOKEN is not defined in environment variables');
        }
        this.octokit = new Octokit({ auth: GITHUB_ACCESS_TOKEN });
        this.owner = GITHUB_USERNAME;
        this.repo = GITHUB_REPO;
        this.branch = GITHUB_BRANCH || 'main'; // Default to main if not specified
    }

    /**
     * Uploads a file to GitHub repository.
     * @param fileBuffer The file content as Buffer.
     * @param filename The desired filename (including path if needed).
     * @param projectSlug Optional project slug for organizing files per project.
     * @returns The public download URL.
     */
    async uploadFile(fileBuffer: Buffer, filename: string, projectSlug?: string): Promise<string> {
        try {
            const content = fileBuffer.toString('base64');
            // Path structure: images/projects/{project-slug}/{filename}
            // Mendukung multiple files per project
            const path = projectSlug
                ? `images/projects/${projectSlug}/${filename}`
                : `images/projects/${filename}`;

            // Check if file exists to get SHA (for update) or just create new
            let sha: string | undefined;
            try {
                const { data } = await this.octokit.rest.repos.getContent({
                    owner: this.owner,
                    repo: this.repo,
                    path,
                    ref: this.branch
                });
                if (data && !Array.isArray(data) && data.sha) {
                    sha = data.sha;
                }
            } catch (error: any) {
                // Ignored: File likely doesn't exist, so we will create it.
                if (error.status !== 404) console.warn('Error checking file existence:', error);
            }

            await this.octokit.rest.repos.createOrUpdateFileContents({
                owner: this.owner,
                repo: this.repo,
                path,
                message: `Upload asset: ${filename}`,
                content,
                branch: this.branch,
                sha
            });

            // Construct raw URL (assuming public repo)
            // Format: https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}
            const publicUrl = `https://raw.githubusercontent.com/${this.owner}/${this.repo}/${this.branch}/${path}`;
            return publicUrl;

        } catch (error: any) {
            console.error('GitHub Upload Error:', error);
            throw new HttpException(500, `Failed to upload to GitHub: ${error.message}`);
        }
    }

    /**
     * Deletes a file from GitHub repository.
     * @param filename The filename to delete.
     * @param projectSlug Optional project slug if file is organized per project.
     */
    async deleteFile(filename: string, projectSlug?: string): Promise<void> {
        try {
            // Path structure harus sama dengan uploadFile
            const path = projectSlug
                ? `images/projects/${projectSlug}/${filename}`
                : `images/projects/${filename}`;

            const { data } = await this.octokit.rest.repos.getContent({
                owner: this.owner,
                repo: this.repo,
                path,
                ref: this.branch
            });

            if (data && !Array.isArray(data) && data.sha) {
                await this.octokit.rest.repos.deleteFile({
                    owner: this.owner,
                    repo: this.repo,
                    path,
                    message: `Delete asset: ${filename}`,
                    sha: data.sha,
                    branch: this.branch
                });
            }
        } catch (error) {
            console.error('GitHub Delete Error:', error);
            // Suppress 404
        }
    }
}

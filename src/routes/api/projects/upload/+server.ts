import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { GitHubStorageService } from '$lib/server/services/github-storage.service';
import busboy from 'busboy';
import type { Readable } from 'stream';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export async function POST(event: RequestEvent) {
    try {
        const githubStorage = new GitHubStorageService();

        const uploadedFile = await parseMultipartFile(event);

        if (!uploadedFile) {
            return json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Upload to GitHub
        const url = await githubStorage.uploadFile(uploadedFile.buffer, uploadedFile.filename);

        return json({
            url,
            filename: uploadedFile.filename,
            size: uploadedFile.size,
            mimeType: uploadedFile.mimeType
        });

    } catch (error: any) {
        console.error('Upload error:', error);
        return json({ error: error.message || 'Upload failed' }, { status: error.status || 500 });
    }
}

interface ParsedFile {
    buffer: Buffer;
    filename: string;
    mimeType: string;
    size: number;
}

function parseMultipartFile(event: RequestEvent): Promise<ParsedFile | null> {
    return new Promise((resolve, reject) => {
        const headers = Object.fromEntries(event.request.headers.entries());
        const bb = busboy({ headers });

        let fileData: ParsedFile | null = null;

        bb.on('file', (fieldname: string, file: Readable, info: any) => {
            const { filename, mimeType } = info;

            if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
                file.resume(); // Drain the stream
                return reject({ status: 400, message: 'Invalid file type' });
            }

            if (!filename) {
                file.resume();
                return reject({ status: 400, message: 'File is missing a name' });
            }

            const chunks: Buffer[] = [];
            let size = 0;

            file.on('data', (chunk: Buffer) => {
                size += chunk.length;
                if (size > MAX_FILE_SIZE) {
                    file.resume(); // Drain the stream
                    return reject({ status: 400, message: 'File size limit exceeded' });
                }
                chunks.push(chunk);
            });

            file.on('end', () => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = filename.substring(filename.lastIndexOf('.'));
                const newFilename = `${fieldname}-${uniqueSuffix}${ext}`;

                fileData = {
                    buffer: Buffer.concat(chunks),
                    filename: newFilename,
                    mimeType,
                    size
                };
            });
        });

        bb.on('finish', () => {
            resolve(fileData);
        });

        bb.on('error', (error) => {
            reject({ status: 500, message: 'File upload error', error });
        });

        if (event.request.body) {
            const reader = event.request.body.getReader();
            const pump = () => {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        bb.end();
                        return;
                    }
                    bb.write(value);
                    pump();
                });
            };
            pump();
        } else {
            reject({ status: 400, message: 'No file uploaded' });
        }
    });
}

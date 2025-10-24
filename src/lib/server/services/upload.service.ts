import busboy from 'busboy';
import { HttpException } from '../exceptions/http.exception';
import fs from 'fs';
import type { Readable } from 'stream';
import path from 'path';
import { getFilePath, getFileUrl } from '../storage/storage.helper';
import type { RequestEvent } from '@sveltejs/kit';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
interface UploadedFile {
	originalName: string;
	fileName: string;
	mimeType: string;
	size: number;
	path: string;
	url: string;
}
export class UploadService {
	async uploadFile(event: RequestEvent): Promise<UploadedFile> {
		return new Promise((resolve, reject) => {
			const headers = Object.fromEntries(event.request.headers.entries());
			const bb = busboy({
				// The `busboy` package expects headers as a plain object.
				headers
			});

			bb.on(
				'file',
				(
					fieldname: string,
					file: Readable,
					filename: string,
					encoding: string,
					mimetype: string
				) => {
					if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
						return reject(new HttpException(400, 'Invalid file type'));
					}

					// In older versions of busboy, the filename parameter could be an object.
					// The type definitions for `@fastify/busboy` show it as a string.
					if (!filename) {
						return reject(new HttpException(400, 'File is missing a name.'));
					}

					const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
					const newFilename = `${fieldname}-${uniqueSuffix}${path.extname(filename)}`;
					const saveTo = getFilePath(newFilename);

					const outStream = fs.createWriteStream(saveTo);
					let size = 0;

					file.on('data', (chunk) => {
						size += chunk.length;
						if (size > MAX_FILE_SIZE) {
							file.unpipe(outStream);
							outStream.destroy();
							fs.unlinkSync(saveTo);
							return reject(new HttpException(400, 'File size limit exceeded'));
						}
						outStream.write(chunk);
					});

					file.on('end', () => {
						outStream.end();
						resolve({
							originalName: filename,
							fileName: newFilename,
							mimeType: mimetype,
							size: size,
							path: saveTo,
							url: getFileUrl(newFilename, event.request)
						});
					});
				}
			);

			bb.on('error', () => {
				reject(new HttpException(500, 'File upload error'));
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
				reject(new HttpException(400, 'No file uploaded'));
			}
		});
	}
}

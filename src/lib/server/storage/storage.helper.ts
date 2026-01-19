import { UPLOADS_DIR } from '$env/static/private';
import fs from 'fs';
import path from 'path';

export const getUploadsDir = () => {
	const uploadsDir = UPLOADS_DIR || './uploads';
	if (!fs.existsSync(uploadsDir)) {
		fs.mkdirSync(uploadsDir, { recursive: true });
	}
	return uploadsDir;
};

export const getFilePath = (fileName: string) => {
	return path.join(getUploadsDir(), fileName);
};

export const getFileUrl = (fileName: string, request: Request) => {
	const host = request.headers.get('host');
	const protocol = host?.includes('localhost') ? 'http' : 'https';
	return `${protocol}://${host}/uploads/${fileName}`;
};

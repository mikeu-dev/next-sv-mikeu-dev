import busboy from 'busboy';
import { getFilePath, getFileUrl } from './storage.helper';
import { HttpException } from '../exceptions/http.exception';
import type { Request } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export class UploadService {
  async uploadFile(request: Request): Promise<any> {
    return new Promise((resolve, reject) => {
      const headers = {};
      request.headers.forEach((value, key) => {
        headers[key] = value;
      });

      const bb = busboy({ headers });

      bb.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
          return reject(new HttpException(400, 'Invalid file type'));
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const newFilename = `${fieldname}-${uniqueSuffix}${path.extname(filename.filename)}`;
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
            originalName: filename.filename,
            fileName: newFilename,
            mimeType: mimetype,
            size: size,
            path: saveTo,
            url: getFileUrl(newFilename, request)
          });
        });
      });

      bb.on('error', (err) => {
        reject(new HttpException(500, 'File upload error'));
      });

      if (request.body) {
        const reader = request.body.getReader();
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

import { describe, it, expect } from 'vitest';
import {
	validateFileSignature,
	validateFileSize,
	validateMimeType,
	generateSafeFilename,
	validateFile
} from './file-validation';

describe('file-validation utility', () => {
	describe('validateFileSignature', () => {
		it('should validate JPEG files correctly', () => {
			const validJpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
			const invalidJpegBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

			expect(validateFileSignature(validJpegBuffer, 'image/jpeg')).toBe(true);
			expect(validateFileSignature(invalidJpegBuffer, 'image/jpeg')).toBe(false);
		});

		it('should validate PNG files correctly', () => {
			const validPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
			const invalidPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x00]);

			expect(validateFileSignature(validPngBuffer, 'image/png')).toBe(true);
			expect(validateFileSignature(invalidPngBuffer, 'image/png')).toBe(false);
		});

		it('should validate GIF files correctly', () => {
			const validGifBuffer = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]);
			const invalidGifBuffer = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x37, 0x00]);

			expect(validateFileSignature(validGifBuffer, 'image/gif')).toBe(true);
			expect(validateFileSignature(invalidGifBuffer, 'image/gif')).toBe(false);
		});

		it('should validate WebP files correctly', () => {
			// WebP requires 'RIFF' at 0-3 and 'WEBP' at 8-11
			const validWebpBuffer = Buffer.alloc(12);
			validWebpBuffer.write('RIFF', 0);
			validWebpBuffer.write('WEBP', 8);

			const invalidWebpBuffer = Buffer.alloc(12);
			invalidWebpBuffer.write('RIFF', 0);
			invalidWebpBuffer.write('WXXX', 8);

			expect(validateFileSignature(validWebpBuffer, 'image/webp')).toBe(true);
			expect(validateFileSignature(invalidWebpBuffer, 'image/webp')).toBe(false);
		});

		it('should return false for unsupported mime type', () => {
			const buffer = Buffer.from([0x00]);
			expect(validateFileSignature(buffer, 'application/pdf')).toBe(false);
		});
	});

	describe('validateFileSize', () => {
		it('should return true for valid file sizes', () => {
			expect(validateFileSize(100, 1000)).toBe(true);
			expect(validateFileSize(1000, 1000)).toBe(true);
		});

		it('should return false for size larger than max', () => {
			expect(validateFileSize(1001, 1000)).toBe(false);
		});

		it('should return false for size less than or equal to 0', () => {
			expect(validateFileSize(0, 1000)).toBe(false);
			expect(validateFileSize(-5, 1000)).toBe(false);
		});
	});

	describe('validateMimeType', () => {
		it('should return true if mime type is allowed', () => {
			expect(validateMimeType('image/png', ['image/png', 'image/jpeg'])).toBe(true);
		});

		it('should return false if mime type is not allowed', () => {
			expect(validateMimeType('application/pdf', ['image/png', 'image/jpeg'])).toBe(false);
		});
	});

	describe('generateSafeFilename', () => {
		it('should return a sanitized filename with timestamp and random suffix', () => {
			const filename = 'my dangerous#file%name.png';
			const safe = generateSafeFilename(filename);

			expect(safe).toContain('.png');
			expect(safe).not.toContain('dangerous#');
			expect(safe).not.toContain('file%');
			// Shard must not contain spaces or special characters except dash and underscore
			expect(safe).toMatch(/^[a-zA-Z0-9-_]+\.[a-zA-Z0-9]+$/);
		});
	});

	describe('validateFile', () => {
		const allowedMimeTypes = ['image/png', 'image/jpeg'];
		const maxSize = 1000;
		const options = { allowedMimeTypes, maxSize };

		it('should return valid true for a correct file', () => {
			const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
			const result = validateFile(buffer, 'test.png', 'image/png', options);
			expect(result.valid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		it('should fail if mime type is not allowed', () => {
			const buffer = Buffer.from([0x00]);
			const result = validateFile(buffer, 'test.pdf', 'application/pdf', options);
			expect(result.valid).toBe(false);
			expect(result.error).toBe('File type not allowed');
		});

		it('should fail if file size exceeds limit', () => {
			const buffer = Buffer.alloc(1001);
			const result = validateFile(buffer, 'test.png', 'image/png', options);
			expect(result.valid).toBe(false);
			expect(result.error).toBe('File size exceeds limit');
		});

		it('should fail if file signature mismatch', () => {
			const buffer = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
			const result = validateFile(buffer, 'test.png', 'image/png', options);
			expect(result.valid).toBe(false);
			expect(result.error).toBe('File signature does not match MIME type');
		});

		it('should fail if filename is empty', () => {
			const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
			const result = validateFile(buffer, '', 'image/png', options);
			expect(result.valid).toBe(false);
			expect(result.error).toBe('Filename is required');
		});
	});
});

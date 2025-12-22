/**
 * File signature validation utilities
 * Validates files by checking magic bytes (file signatures) to prevent MIME type spoofing
 */

/**
 * File signatures (magic bytes) for supported file types
 */
const FILE_SIGNATURES: Record<string, number[][]> = {
    'image/jpeg': [
        [0xff, 0xd8, 0xff, 0xe0], // JPEG JFIF
        [0xff, 0xd8, 0xff, 0xe1], // JPEG Exif
        [0xff, 0xd8, 0xff, 0xe2], // JPEG JPEG/JFIF
        [0xff, 0xd8, 0xff, 0xe3], // JPEG
        [0xff, 0xd8, 0xff, 0xe8] // JPEG SPIFF
    ],
    'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
    'image/gif': [
        [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
        [0x47, 0x49, 0x46, 0x38, 0x39, 0x61] // GIF89a
    ],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]] // RIFF (WebP starts with RIFF)
};

/**
 * Validate file signature (magic bytes) against MIME type
 * 
 * @param buffer - File buffer to validate
 * @param mimeType - Expected MIME type
 * @returns true if file signature matches MIME type
 */
export function validateFileSignature(buffer: Buffer, mimeType: string): boolean {
    const signatures = FILE_SIGNATURES[mimeType];
    if (!signatures) {
        return false;
    }

    // Special handling for WebP - need to check RIFF + WEBP
    if (mimeType === 'image/webp') {
        const hasRIFF = signatures[0].every((byte, i) => buffer[i] === byte);
        const hasWEBP =
            buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
        return hasRIFF && hasWEBP;
    }

    // Check if buffer starts with any of the valid signatures
    return signatures.some((signature) => signature.every((byte, i) => buffer[i] === byte));
}

/**
 * Validate file size
 * 
 * @param size - File size in bytes
 * @param maxSize - Maximum allowed size in bytes
 * @returns true if file size is within limit
 */
export function validateFileSize(size: number, maxSize: number): boolean {
    return size > 0 && size <= maxSize;
}

/**
 * Validate MIME type against allowed types
 * 
 * @param mimeType - MIME type to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns true if MIME type is allowed
 */
export function validateMimeType(mimeType: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(mimeType);
}

/**
 * Generate safe filename
 * Removes potentially dangerous characters and adds timestamp
 * 
 * @param originalFilename - Original filename
 * @returns Safe filename with timestamp
 */
export function generateSafeFilename(originalFilename: string): string {
    // Extract extension
    const ext = originalFilename.substring(originalFilename.lastIndexOf('.'));

    // Remove extension and sanitize filename
    const nameWithoutExt = originalFilename.substring(0, originalFilename.lastIndexOf('.'));
    const safeName = nameWithoutExt
        .replace(/[^a-zA-Z0-9-_]/g, '-') // Replace unsafe chars with dash
        .replace(/-+/g, '-') // Replace multiple dashes with single dash
        .substring(0, 50); // Limit length

    // Add timestamp and random suffix
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1e9);

    return `${safeName}-${timestamp}-${randomSuffix}${ext}`;
}

/**
 * Comprehensive file validation
 * 
 * @param buffer - File buffer
 * @param filename - Original filename
 * @param mimeType - MIME type from upload
 * @param options - Validation options
 * @returns Validation result with error message if invalid
 */
export function validateFile(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    options: {
        allowedMimeTypes: string[];
        maxSize: number;
    }
): { valid: boolean; error?: string } {
    // Validate MIME type
    if (!validateMimeType(mimeType, options.allowedMimeTypes)) {
        return { valid: false, error: 'File type not allowed' };
    }

    // Validate file size
    if (!validateFileSize(buffer.length, options.maxSize)) {
        return { valid: false, error: 'File size exceeds limit' };
    }

    // Validate file signature (magic bytes)
    if (!validateFileSignature(buffer, mimeType)) {
        return { valid: false, error: 'File signature does not match MIME type' };
    }

    // Validate filename
    if (!filename || filename.length === 0) {
        return { valid: false, error: 'Filename is required' };
    }

    return { valid: true };
}

import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';

export interface UploadedFile {
    filename: string;
    filepath: string; // Will be blob URL, 'database', or local path
    size: number;
    fileData?: string; // Base64 data when stored in database
}

/**
 * Save uploaded file to Vercel Blob (if configured), Database (fallback), or local storage (development)
 */
export async function saveUploadedFile(
    file: File,
    subfolder: string = 'pdfs'
): Promise<UploadedFile> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.name);
    const filename = `${timestamp}-${randomString}${extension}`;

    // Check if we're in production (Vercel) or development
    const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

    if (isProduction) {
        // Try Vercel Blob first if token is available
        if (process.env.BLOB_READ_WRITE_TOKEN) {
            try {
                const blob = await put(`${subfolder}/${filename}`, buffer, {
                    access: 'public',
                    contentType: file.type || 'application/pdf',
                });

                console.log(`[Upload] File uploaded to Vercel Blob: ${blob.url}`);

                return {
                    filename,
                    filepath: blob.url,
                    size: buffer.length,
                };
            } catch (error) {
                console.error('[Upload] Vercel Blob upload failed:', error);
                // Fall through to database storage
            }
        }

        // Fallback to database storage (production without Blob configured)
        console.log('[Upload] Using database storage (Blob not configured)');
        const base64Data = buffer.toString('base64');

        return {
            filename,
            filepath: 'database', // Special indicator
            size: buffer.length,
            fileData: base64Data,
        }
    } else {
        // Development: Save locally
        console.log('[Upload] Using local file storage (development mode)');

        const uploadDir = path.join(process.cwd(), 'uploads', subfolder);
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        return {
            filename,
            filepath: `/uploads/${subfolder}/${filename}`,
            size: buffer.length,
        };
    }
}

/**
 * Extract file from FormData
 */
export async function getFileFromRequest(
    request: NextRequest,
    fieldName: string = 'file'
): Promise<File | null> {
    try {
        const formData = await request.formData();
        const file = formData.get(fieldName) as File | null;
        return file;
    } catch (error) {
        return null;
    }
}

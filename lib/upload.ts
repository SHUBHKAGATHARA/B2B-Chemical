import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';

export interface UploadedFile {
    filename: string;
    filepath: string;
    size: number;
}

/**
 * Save uploaded file to uploads directory
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

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'uploads', subfolder);
    if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
    }

    // Save file
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return {
        filename,
        filepath: `/uploads/${subfolder}/${filename}`,
        size: buffer.length,
    };
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

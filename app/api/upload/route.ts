import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { successResponse } from '@/lib/utils/api-response';

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = (formData.get('folder') as string) || 'uploads';

        if (!file) {
            return NextResponse.json(
                { success: false, error: { code: 'VALIDATION_ERROR', message: 'No file provided' } },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { success: false, error: { code: 'VALIDATION_ERROR', message: 'Only image files are allowed' } },
                { status: 400 }
            );
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: { code: 'VALIDATION_ERROR', message: 'File size must be less than 5MB' } },
                { status: 400 }
            );
        }

        const result = await uploadToCloudinary(file, folder);

        return successResponse({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
        }, 201);
    } catch (error: any) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to upload file', details: error.message } },
            { status: 500 }
        );
    }
}

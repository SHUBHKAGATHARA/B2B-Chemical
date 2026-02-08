import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const runtime = 'nodejs';

/**
 * POST: Upload image to Cloudinary
 * Accepts multipart/form-data with 'file' field
 * Optional 'folder' field to organize uploads
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = formData.get('folder') as string || 'general';

        if (!file) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'MISSING_FILE',
                        message: 'No file provided',
                    },
                },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'INVALID_FILE_TYPE',
                        message: 'Only image files are allowed',
                    },
                },
                { status: 400 }
            );
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'FILE_TOO_LARGE',
                        message: 'File size must be less than 5MB',
                    },
                },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const uploadResult = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `b2b-chemical/${folder}`,
                    resource_type: 'image',
                    transformation: [
                        { width: 1200, height: 1200, crop: 'limit' },
                        { quality: 'auto' },
                        { fetch_format: 'auto' },
                    ],
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            uploadStream.end(buffer);
        });

        return NextResponse.json({
            success: true,
            data: {
                url: uploadResult.secure_url,
                publicId: uploadResult.public_id,
                width: uploadResult.width,
                height: uploadResult.height,
                format: uploadResult.format,
                size: uploadResult.bytes,
            },
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'UPLOAD_FAILED',
                    message: 'Failed to upload image',
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
                },
            },
            { status: 500 }
        );
    }
}

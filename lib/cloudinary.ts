import { v2 as cloudinary } from 'cloudinary';

// Log configuration status (masked for security)
console.log('[Cloudinary Config] Environment check:', {
    hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
    hasApiKey: !!process.env.CLOUDINARY_API_KEY,
    hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME?.substring(0, 3) + '***',
});

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
}

/**
 * Upload image to Cloudinary
 * @param file - File object from form data
 * @param folder - Cloudinary folder name (default: 'company-logos')
 * @returns Cloudinary upload result with secure_url
 */
export async function uploadToCloudinary(
    file: File,
    folder: string = 'company-logos'
): Promise<CloudinaryUploadResult> {
    console.log('[Cloudinary] Starting upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        folder: folder
    });
    
    try {
        // Check if Cloudinary is configured
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.error('[Cloudinary] Missing configuration:', {
                hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
                hasApiKey: !!process.env.CLOUDINARY_API_KEY,
                hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
            });
            throw new Error('Cloudinary configuration is missing');
        }
        
        // Convert file to buffer
        console.log('[Cloudinary] Converting file to buffer...');
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        console.log('[Cloudinary] Buffer created, size:', buffer.length);

        // Convert buffer to base64
        const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
        console.log('[Cloudinary] Base64 conversion complete, uploading to Cloudinary...');

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(base64Image, {
            folder,
            resource_type: 'image',
            transformation: [
                { width: 500, height: 500, crop: 'limit' }, // Limit max dimensions
                { quality: 'auto' }, // Auto quality optimization
                { fetch_format: 'auto' }, // Auto format (WebP when supported)
            ],
        });

        console.log('[Cloudinary] Upload successful:', {
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height
        });

        return {
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            resource_type: result.resource_type,
        };
    } catch (error) {
        console.error('[Cloudinary] Upload failed:', error);
        console.error('[Cloudinary] Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        throw new Error(`Failed to upload image to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Delete image from Cloudinary
 * @param publicId - Cloudinary public_id of the image
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId);
        console.log(`[Cloudinary] Deleted image: ${publicId}`);
    } catch (error) {
        console.error('[Cloudinary] Delete failed:', error);
        throw new Error('Failed to delete image from Cloudinary');
    }
}

/**
 * Extract public_id from Cloudinary URL
 * @param url - Cloudinary secure_url
 * @returns public_id or null
 */
export function extractPublicId(url: string): string | null {
    try {
        // Example URL: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/image.jpg
        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1) return null;

        // Get everything after 'upload/vXXXXXXXXXX/'
        const pathParts = parts.slice(uploadIndex + 2); // Skip 'upload' and version
        const publicIdWithExtension = pathParts.join('/');

        // Remove file extension
        const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
        return publicId;
    } catch (error) {
        console.error('[Cloudinary] Failed to extract public_id:', error);
        return null;
    }
}

/**
 * Validate image file
 * @param file - File to validate
 * @param maxSizeInMB - Maximum file size in MB (default: 5MB)
 */
export function validateImageFile(file: File, maxSizeInMB: number = 5): { valid: boolean; error?: string } {
    const validTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Invalid file type. Only PNG, JPG, JPEG, and WEBP are allowed.',
        };
    }

    if (file.size > maxSizeInBytes) {
        return {
            valid: false,
            error: `File size exceeds ${maxSizeInMB}MB limit.`,
        };
    }

    return { valid: true };
}

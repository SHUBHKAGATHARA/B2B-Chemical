import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { uploadToCloudinary, validateImageFile, deleteFromCloudinary, extractPublicId } from '@/lib/cloudinary';

/**
 * GET /api/company-settings
 * Fetch company settings (accessible to all authenticated users)
 */
export async function GET(request: NextRequest) {
    try {
        const session = await requireAuth();

        // Get the latest company settings
        const settings = await prisma.companySettings.findFirst({
            orderBy: { updatedAt: 'desc' },
        });

        if (!settings) {
            return NextResponse.json(
                { error: 'No company settings found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: settings,
        });
    } catch (error: any) {
        console.error('[Company Settings] GET error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch company settings' },
            { status: error.message?.includes('Unauthorized') ? 401 : 500 }
        );
    }
}

/**
 * POST /api/company-settings
 * Create or update company settings (Admin only)
 */
export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth();

        // Check if user is admin
        if (session.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden: Only admins can modify company settings' },
                { status: 403 }
            );
        }

        const formData = await request.formData();

        // Extract form fields
        const companyName = formData.get('companyName') as string;
        const distributorName = formData.get('distributorName') as string | null;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;
        const address = formData.get('address') as string;
        const taxRegistrationId = formData.get('taxRegistrationId') as string | null;
        const logoFile = formData.get('logo') as File | null;

        // Validate required fields
        if (!companyName || !email || !phone || !address) {
            return NextResponse.json(
                { error: 'Missing required fields: companyName, email, phone, address' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        let logoUrl: string | null = null;
        let oldLogoPublicId: string | null = null;

        // Get existing settings to check for old logo
        const existingSettings = await prisma.companySettings.findFirst({
            orderBy: { updatedAt: 'desc' },
        });

        if (existingSettings?.logoUrl) {
            oldLogoPublicId = extractPublicId(existingSettings.logoUrl);
        }

        // Handle logo upload if provided
        if (logoFile && logoFile.size > 0) {
            // Validate image file
            const validation = validateImageFile(logoFile, 5);
            if (!validation.valid) {
                return NextResponse.json(
                    { error: validation.error },
                    { status: 400 }
                );
            }

            try {
                // Upload to Cloudinary
                const uploadResult = await uploadToCloudinary(logoFile, 'company-logos');
                logoUrl = uploadResult.secure_url;

                // Delete old logo if exists
                if (oldLogoPublicId) {
                    try {
                        await deleteFromCloudinary(oldLogoPublicId);
                    } catch (deleteError) {
                        console.error('[Company Settings] Failed to delete old logo:', deleteError);
                        // Continue even if delete fails
                    }
                }
            } catch (uploadError: any) {
                console.error('[Company Settings] Logo upload failed:', uploadError);
                return NextResponse.json(
                    { error: 'Failed to upload logo image' },
                    { status: 500 }
                );
            }
        } else if (existingSettings?.logoUrl) {
            // Keep existing logo if no new logo provided
            logoUrl = existingSettings.logoUrl;
        }

        // Create or update company settings
        const settings = await prisma.companySettings.create({
            data: {
                companyName,
                distributorName: distributorName || null,
                email,
                phone,
                address,
                taxRegistrationId: taxRegistrationId || null,
                logoUrl,
            },
        });

        // Log the action
        await prisma.log.create({
            data: {
                action: `Company settings ${existingSettings ? 'updated' : 'created'}`,
                userId: session.userId,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Company settings saved successfully',
            data: settings,
        });
    } catch (error: any) {
        console.error('[Company Settings] POST error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to save company settings' },
            { status: error.message?.includes('Unauthorized') ? 401 : error.message?.includes('Forbidden') ? 403 : 500 }
        );
    }
}

/**
 * DELETE /api/company-settings
 * Delete company settings (Admin only)
 */
export async function DELETE(request: NextRequest) {
    try {
        const session = await requireAuth();

        // Check if user is admin
        if (session.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden: Only admins can delete company settings' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Missing company settings ID' },
                { status: 400 }
            );
        }

        // Get settings to delete logo from Cloudinary
        const settings = await prisma.companySettings.findUnique({
            where: { id },
        });

        if (!settings) {
            return NextResponse.json(
                { error: 'Company settings not found' },
                { status: 404 }
            );
        }

        // Delete logo from Cloudinary if exists
        if (settings.logoUrl) {
            const publicId = extractPublicId(settings.logoUrl);
            if (publicId) {
                try {
                    await deleteFromCloudinary(publicId);
                } catch (deleteError) {
                    console.error('[Company Settings] Failed to delete logo:', deleteError);
                    // Continue even if delete fails
                }
            }
        }

        // Delete from database
        await prisma.companySettings.delete({
            where: { id },
        });

        // Log the action
        await prisma.log.create({
            data: {
                action: 'Company settings deleted',
                userId: session.userId,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Company settings deleted successfully',
        });
    } catch (error: any) {
        console.error('[Company Settings] DELETE error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete company settings' },
            { status: error.message?.includes('Unauthorized') ? 401 : error.message?.includes('Forbidden') ? 403 : 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { updateDistributorSchema } from '@/lib/validations/schemas';
import { uploadToCloudinary, validateImageFile, deleteFromCloudinary, extractPublicId } from '@/lib/cloudinary';

// Force dynamic rendering and Node.js runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Get single distributor
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireAdmin();
        const { id } = params;

        const distributor = await prisma.distributor.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        pdfAssignments: true,
                        notifications: true,
                    },
                },
            },
        });

        if (!distributor) {
            return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
        }

        return NextResponse.json({ distributor });
    } catch (error: any) {
        if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update distributor with logo upload support
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requireAdmin();
        const { id } = params;

        // Parse form data (supports both JSON and multipart/form-data)
        const contentType = request.headers.get('content-type') || '';
        let formData: FormData | null = null;
        let body: any = {};
        let logoFile: File | null = null;

        if (contentType.includes('multipart/form-data')) {
            formData = await request.formData();

            // Extract fields from form data
            body = {
                companyName: formData.get('companyName'),
                email: formData.get('email'),
                status: formData.get('status'),
            };

            // Extract logo file if present
            const logo = formData.get('logo');
            console.log('[Distributor API PUT] Logo from formData:', logo);
            if (logo && logo instanceof File && logo.size > 0) {
                logoFile = logo;
                console.log('[Distributor API PUT] Logo file detected:', {
                    name: logoFile.name,
                    size: logoFile.size,
                    type: logoFile.type
                });
            } else if (logo) {
                console.log('[Distributor API PUT] Logo found but invalid:', {
                    isFile: logo instanceof File,
                    size: logo instanceof File ? logo.size : 'N/A'
                });
            }
        } else {
            // Handle JSON request
            body = await request.json();
        }

        // Validate input
        const validation = updateDistributorSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.errors },
                { status: 400 }
            );
        }

        // Validate logo file if provided
        if (logoFile) {
            const validation = validateImageFile(logoFile, 5);
            if (!validation.valid) {
                return NextResponse.json(
                    { error: validation.error || 'Invalid logo file' },
                    { status: 400 }
                );
            }
        }

        // Get current distributor to check for existing logo
        const currentDistributor = await prisma.distributor.findUnique({
            where: { id },
            select: { logoUrl: true, email: true },
        });

        if (!currentDistributor) {
            return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
        }

        // Prepare update data
        const data: any = {};
        if (validation.data.companyName) data.companyName = validation.data.companyName;
        if (validation.data.email) data.email = validation.data.email;
        if (validation.data.status) data.status = validation.data.status;

        // Upload new logo if provided
        if (logoFile) {
            console.log('[Distributor API PUT] Starting Cloudinary upload for file:', logoFile.name);
            try {
                const uploadResult = await uploadToCloudinary(logoFile, 'distributor-logos');
                data.logoUrl = uploadResult.secure_url;
                console.log('[Distributor API PUT] Cloudinary upload successful:', data.logoUrl);

                // Delete old logo from Cloudinary if exists
                if (currentDistributor.logoUrl) {
                    console.log('[Distributor API PUT] Deleting old logo:', currentDistributor.logoUrl);
                    const oldLogoPublicId = extractPublicId(currentDistributor.logoUrl);
                    if (oldLogoPublicId) {
                        try {
                            await deleteFromCloudinary(oldLogoPublicId);
                        } catch (error) {
                            console.error('Failed to delete old logo:', error);
                        }
                    }
                }
            } catch (error) {
                console.error('Logo upload failed:', error);
                return NextResponse.json(
                    { error: 'Failed to upload logo' },
                    { status: 500 }
                );
            }
        }

        // Update distributor
        console.log('[Distributor API PUT] Updating distributor with data:', data);
        const distributor = await prisma.distributor.update({
            where: { id },
            data,
        });
        console.log('[Distributor API PUT] Update successful, logoUrl:', distributor.logoUrl);

        // Also update corresponding user if email or status changed
        if (validation.data.email || validation.data.status || validation.data.companyName) {
            const userUpdate: any = {};
            if (validation.data.email) userUpdate.email = validation.data.email;
            if (validation.data.status) userUpdate.status = validation.data.status;
            if (validation.data.companyName) userUpdate.fullName = validation.data.companyName;

            await prisma.user.updateMany({
                where: { email: currentDistributor.email },
                data: userUpdate,
            });
        }

        // Log action
        await prisma.log.create({
            data: {
                action: `Updated distributor: ${distributor.email}${logoFile ? ' (logo updated)' : ''}`,
                userId: session.userId,
            },
        });

        return NextResponse.json({ distributor });
    } catch (error: any) {
        if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('Update distributor error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete distributor and logo
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requireAdmin();
        const { id } = params;

        const distributor = await prisma.distributor.findUnique({
            where: { id },
            select: { email: true, logoUrl: true },
        });

        if (!distributor) {
            return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
        }

        // Delete logo from Cloudinary if exists
        if (distributor.logoUrl) {
            const logoPublicId = extractPublicId(distributor.logoUrl);
            if (logoPublicId) {
                try {
                    await deleteFromCloudinary(logoPublicId);
                } catch (error) {
                    console.error('Failed to delete logo from Cloudinary:', error);
                    // Continue with deletion even if Cloudinary delete fails
                }
            }
        }

        // Delete distributor and corresponding user
        await prisma.$transaction(async (tx) => {
            await tx.distributor.delete({ where: { id } });
            await tx.user.deleteMany({ where: { email: distributor.email } });
        });

        // Log action
        await prisma.log.create({
            data: {
                action: `Deleted distributor: ${distributor.email}`,
                userId: session.userId,
            },
        });

        return NextResponse.json({ message: 'Distributor deleted successfully' });
    } catch (error: any) {
        if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('Delete distributor error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

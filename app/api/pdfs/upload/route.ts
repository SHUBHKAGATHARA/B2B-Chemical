import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { saveUploadedFile, getFileFromRequest } from '@/lib/upload';

// Force Node.js runtime (bcryptjs not compatible with Edge Runtime)
export const runtime = 'nodejs';


// POST - Upload PDF and assign to distributors
export async function POST(request: NextRequest) {
    try {
        const session = await requireAdmin();

        // Get form data
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const assignedGroup = formData.get('assignedGroup') as string;
        const distributorIdsStr = formData.get('distributorIds') as string;

        // Validate file
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!file.name.endsWith('.pdf')) {
            return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
        }

        // Validate assignment type
        if (!['SINGLE', 'MULTIPLE', 'ALL'].includes(assignedGroup)) {
            return NextResponse.json({ error: 'Invalid assignment type' }, { status: 400 });
        }

        // Parse distributor IDs
        let distributorIds: string[] = [];
        if (distributorIdsStr) {
            try {
                distributorIds = JSON.parse(distributorIdsStr);
            } catch {
                distributorIds = distributorIdsStr.split(',').filter(Boolean);
            }
        }

        // Save file
        const uploadedFile = await saveUploadedFile(file, 'pdfs');

        // Get all distributors if assigning to ALL
        let targetDistributorIds: string[] = distributorIds;
        if (assignedGroup === 'ALL') {
            const allDistributors = await prisma.distributor.findMany({
                where: { status: 'ACTIVE' },
                select: { id: true },
            });
            targetDistributorIds = allDistributors.map((d) => d.id);
        }

        // Create PDF records and notifications in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create base PDF upload record
            const firstDistId = targetDistributorIds.length > 0 ? targetDistributorIds[0] : null;

            const pdfUpload = await tx.pdfUpload.create({
                data: {
                    fileName: file.name,
                    fileUrl: uploadedFile.filepath,
                    uploadedByAdminId: session.userId,
                    assignedDistributorId: firstDistId,
                    assignedGroup,
                    status: 'PENDING',
                },
            });

            // Create notifications for all targeted distributors
            if (targetDistributorIds.length > 0) {
                await tx.notification.createMany({
                    data: targetDistributorIds.map((distId) => ({
                        pdfId: pdfUpload.id,
                        distId,
                        readFlag: false,
                    })),
                });
            }

            return pdfUpload;
        });

        // Log action
        await prisma.log.create({
            data: {
                action: `Uploaded PDF: ${file.name} (${assignedGroup}, ${targetDistributorIds.length} distributors)`,
                userId: session.userId,
            },
        });

        return NextResponse.json({ pdf: result }, { status: 201 });
    } catch (error: any) {
        if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('Upload PDF error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

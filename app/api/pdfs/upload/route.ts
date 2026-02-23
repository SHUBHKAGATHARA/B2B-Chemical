import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { saveUploadedFile, getFileFromRequest } from '@/lib/upload';
import { AssignType } from '@prisma/client';

// Force dynamic rendering and Node.js runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// POST - Upload PDF and assign to distributors
export async function POST(request: NextRequest) {
    try {
        const session = await requireAdmin();

        // Get form data
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const assignedGroup = formData.get('assignedGroup') as AssignType;
        const distributorIdsStr = formData.get('distributorIds') as string;
        const categoryId = formData.get('categoryId') as string | null;
        const description = formData.get('description') as string | null;

        console.log('[PDF Upload] Form data received:', {
            fileName: file?.name,
            assignedGroup,
            categoryId,
            description,
            distributorIdsStr
        });

        // Validate file
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!file.name.endsWith('.pdf')) {
            return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
        }

        // Validate category
        if (!categoryId || categoryId.trim() === '') {
            console.error('[PDF Upload] Category is missing or empty');
            return NextResponse.json({ error: 'Category is required' }, { status: 400 });
        }

        // Verify category exists
        const categoryExists = await prisma.pdfCategory.findUnique({
            where: { id: categoryId }
        });

        if (!categoryExists) {
            console.error('[PDF Upload] Category not found:', categoryId);
            return NextResponse.json({ error: 'Invalid category selected' }, { status: 400 });
        }

        console.log('[PDF Upload] Category validated:', categoryExists.name);

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
                    fileData: uploadedFile.fileData || null, // Store base64 if database storage
                    uploadedByAdminId: session.userId,
                    assignedDistributorId: firstDistId,
                    assignedGroup,
                    categoryId: categoryId.trim(),
                    description: description || null,
                    status: 'PENDING',
                },
            });

            console.log('[PDF Upload] PDF created with ID:', pdfUpload.id, 'categoryId:', pdfUpload.categoryId);

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

        // Fetch the complete PDF with relations for the response
        const completePdf = await prisma.pdfUpload.findUnique({
            where: { id: result.id },
            include: {
                uploadedBy: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
                distributor: {
                    select: {
                        id: true,
                        companyName: true,
                    },
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json({ pdf: completePdf }, { status: 201 });
    } catch (error: any) {
        if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('Upload PDF error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { readFile } from 'fs/promises';
import path from 'path';

// Force dynamic rendering and Node.js runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Download PDF (with access control)
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        // Get PDF details
        const pdf = await prisma.pdfUpload.findUnique({
            where: { id },
            include: {
                distributor: true,
            },
        });

        if (!pdf) {
            return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
        }

        // Authorization check
        let hasAccess = false;

        if (session.role === 'ADMIN') {
            hasAccess = true;
        } else if (session.role === 'DISTRIBUTOR') {
            // Check if distributor has access
            const distributor = await prisma.distributor.findUnique({
                where: { email: session.email },
                select: { id: true },
            });

            if (distributor) {
                // Check if assigned to this distributor or assigned to ALL
                if (pdf.assignedGroup === 'ALL' || pdf.assignedDistributorId === distributor.id) {
                    hasAccess = true;

                    // Mark notification as read and update PDF status to DONE
                    await Promise.all([
                        prisma.notification.updateMany({
                            where: {
                                pdfId: pdf.id,
                                distId: distributor.id,
                                readFlag: false,
                            },
                            data: {
                                readFlag: true,
                            },
                        }),
                        // Update PDF status to DONE after download
                        prisma.pdfUpload.update({
                            where: { id: pdf.id },
                            data: { status: 'DONE' },
                        }),
                    ]);
                }
            }
        }

        if (!hasAccess) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Check if fileUrl is a blob URL or local path
        const isBlob = pdf.fileUrl.startsWith('https://');

        if (isBlob) {
            // For blob URLs, redirect to the URL directly
            return NextResponse.redirect(pdf.fileUrl);
        } else {
            // For local files (development mode only)
            const filePath = path.join(process.cwd(), pdf.fileUrl);
            const fileBuffer = await readFile(filePath);

            // Return file
            return new NextResponse(fileBuffer, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="${pdf.fileName}"`,
                },
            });
        }
    } catch (error: any) {
        console.error('Download PDF error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';

// Force dynamic rendering and Node.js runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// DELETE - Delete a PDF
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requireAdmin();

        // 1. Check if the PDF exists
        const pdf = await prisma.pdfUpload.findUnique({
            where: { id: params.id },
        });

        if (!pdf) {
            return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
        }

        // 2. Delete the PDF record from the database
        // Note: The cascading delete in the schema will handle cleaning up related Notifications.
        // If file storage cleanup is needed, it would happen here (e.g., deleting from filesystem or blob storage)
        await prisma.pdfUpload.delete({
            where: { id: params.id },
        });

        // 3. Log the action
        await prisma.log.create({
            data: {
                action: `Deleted PDF: ${pdf.fileName}`,
                userId: session.userId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('Delete PDF error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

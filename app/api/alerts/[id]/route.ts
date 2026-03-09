import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { successResponse } from '@/lib/utils/api-response';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// PUT: Update alert (Admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Admin access required' } },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { title, message, imageUrl, status, startDate, endDate } = body;

        const alert = await prisma.alert.update({
            where: { id: params.id },
            data: {
                ...(title && { title: title.trim() }),
                ...(message && { message: message.trim() }),
                ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
                ...(status && { status }),
                ...(startDate && { startDate: new Date(startDate) }),
                ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
            },
        });

        return successResponse(alert);
    } catch (error: any) {
        console.error('Error updating alert:', error);
        
        if (error.code === 'P2025') {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Alert not found' } },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update alert', details: error.message } },
            { status: 500 }
        );
    }
}

// DELETE: Delete alert (Admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Admin access required' } },
                { status: 403 }
            );
        }

        await prisma.alert.delete({
            where: { id: params.id },
        });

        const response = successResponse({ message: 'Alert deleted successfully' });
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        return response;
    } catch (error: any) {
        console.error('Error deleting alert:', error);
        
        if (error.code === 'P2025') {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Alert not found' } },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete alert', details: error.message } },
            { status: 500 }
        );
    }
}

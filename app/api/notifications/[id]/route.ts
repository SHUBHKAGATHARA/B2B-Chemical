import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';
import { getDistributorIdByEmail } from '@/lib/cache/distributor-cache';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * PATCH /api/notifications/[id]
 * Mark a single notification as read.
 * Only the owning distributor can mark their own notifications.
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requireAuth();

        // Admins have no notifications — return gracefully
        if (session.role === 'ADMIN') {
            return NextResponse.json({ success: true, message: 'No action needed' });
        }

        const distributorId = await getDistributorIdByEmail(session.email);


        if (!distributorId) {
            return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
        }

        const { id } = params;

        // Update only if the notification belongs to this distributor
        const updated = await prisma.notification.updateMany({
            where: {
                id,
                distId: distributorId,
            },
            data: { readFlag: true },
        });

        if (updated.count === 0) {
            return NextResponse.json(
                { error: 'Notification not found or not owned by this distributor' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Notification marked as read',
        });
    } catch (error: any) {
        console.error('[Notifications] PATCH error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to mark notification as read' },
            { status: error.message?.includes('Unauthorized') ? 401 : 500 }
        );
    }
}

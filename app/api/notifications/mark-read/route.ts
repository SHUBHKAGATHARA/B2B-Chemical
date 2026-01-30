import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { getDistributorIdByEmail } from '@/lib/cache/distributor-cache';

/**
 * POST /api/notifications/mark-read
 * Mark notification(s) as read
 */
export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth();
        const body = await request.json();
        const { notificationIds, markAll } = body;

        if (session.role === 'DISTRIBUTOR') {
            // Get distributor ID
            const distributorId = await getDistributorIdByEmail(session.email);

            if (!distributorId) {
                return NextResponse.json(
                    { error: 'Distributor not found' },
                    { status: 404 }
                );
            }

            if (markAll) {
                // Mark all notifications as read for this distributor
                await prisma.notification.updateMany({
                    where: {
                        distId: distributorId,
                        readFlag: false,
                    },
                    data: {
                        readFlag: true,
                    },
                });

                return NextResponse.json({
                    success: true,
                    message: 'All notifications marked as read',
                });
            }

            if (!notificationIds || !Array.isArray(notificationIds)) {
                return NextResponse.json(
                    { error: 'notificationIds array is required' },
                    { status: 400 }
                );
            }

            // Mark specific notifications as read (only if they belong to this distributor)
            await prisma.notification.updateMany({
                where: {
                    id: { in: notificationIds },
                    distId: distributorId,
                },
                data: {
                    readFlag: true,
                },
            });

            return NextResponse.json({
                success: true,
                message: `${notificationIds.length} notification(s) marked as read`,
            });
        } else if (session.role === 'ADMIN') {
            // Admins can mark any notifications as read
            if (markAll) {
                await prisma.notification.updateMany({
                    where: {
                        readFlag: false,
                    },
                    data: {
                        readFlag: true,
                    },
                });

                return NextResponse.json({
                    success: true,
                    message: 'All notifications marked as read',
                });
            }

            if (!notificationIds || !Array.isArray(notificationIds)) {
                return NextResponse.json(
                    { error: 'notificationIds array is required' },
                    { status: 400 }
                );
            }

            await prisma.notification.updateMany({
                where: {
                    id: { in: notificationIds },
                },
                data: {
                    readFlag: true,
                },
            });

            return NextResponse.json({
                success: true,
                message: `${notificationIds.length} notification(s) marked as read`,
            });
        }

        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 403 }
        );
    } catch (error: any) {
        console.error('[Notifications] Mark read error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to mark notifications as read' },
            { status: error.message?.includes('Unauthorized') ? 401 : 500 }
        );
    }
}

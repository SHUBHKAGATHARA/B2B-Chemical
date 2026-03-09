import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse } from '@/lib/utils/api-response';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// GET: Get active public alerts (No auth required)
export async function GET(request: NextRequest) {
    try {
        const now = new Date();

        const alerts = await prisma.alert.findMany({
            where: {
                status: 'ACTIVE',
                startDate: {
                    lte: now,
                },
                OR: [
                    { endDate: null },
                    { endDate: { gte: now } },
                ],
            },
            select: {
                id: true,
                alertId: true,
                title: true,
                message: true,
                status: true,
                startDate: true,
                endDate: true,
            },
            orderBy: [
                { createdAt: 'desc' },
                { id: 'desc' },
            ],
        });

        const response = successResponse(alerts);
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        return response;
    } catch (error: any) {
        console.error('Error fetching active alerts:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch active alerts', details: error.message } },
            { status: 500 }
        );
    }
}

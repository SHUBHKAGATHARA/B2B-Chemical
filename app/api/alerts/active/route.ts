import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse } from '@/lib/utils/api-response';

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

        return successResponse(alerts);
    } catch (error: any) {
        console.error('Error fetching active alerts:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch active alerts', details: error.message } },
            { status: 500 }
        );
    }
}

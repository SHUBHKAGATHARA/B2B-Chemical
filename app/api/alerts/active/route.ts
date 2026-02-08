import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse } from '@/lib/utils/api-response';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET: Fetch active alerts for distributors
 * Returns only ACTIVE alerts that are currently within their date range
 */
export async function GET(request: NextRequest) {
    try {
        const now = new Date();

        const alerts = await prisma.alert.findMany({
            where: {
                status: 'ACTIVE',
                startDate: {
                    lte: now, // Start date is less than or equal to now
                },
                OR: [
                    { endDate: null }, // No end date
                    { endDate: { gte: now } }, // End date is greater than or equal to now
                ],
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                alertId: true,
                title: true,
                message: true,
                imageUrl: true,
                buttonText: true,
                buttonAction: true,
                startDate: true,
                endDate: true,
                createdAt: true,
            },
        });

        return successResponse({
            alerts,
            count: alerts.length,
        });
    } catch (error: any) {
        console.error('Error fetching active alerts:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch active alerts', details: error.message } },
            { status: 500 }
        );
    }
}

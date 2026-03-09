import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { successResponse } from '@/lib/utils/api-response';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// GET: List all alerts (Admin only)
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Admin access required' } },
                { status: 403 }
            );
        }

        const alerts = await prisma.alert.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        const response = successResponse(alerts);
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        return response;
    } catch (error: any) {
        console.error('Error fetching alerts:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch alerts', details: error.message } },
            { status: 500 }
        );
    }
}

// POST: Create new alert (Admin only)
export async function POST(request: NextRequest) {
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

        if (!title || !message) {
            return NextResponse.json(
                { success: false, error: { code: 'VALIDATION_ERROR', message: 'Title and message are required' } },
                { status: 400 }
            );
        }

        // Generate unique alertId
        const alertId = `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const alert = await prisma.alert.create({
            data: {
                alertId,
                title: title.trim(),
                message: message.trim(),
                imageUrl: imageUrl || null,
                buttonText: null,
                buttonAction: null,
                status: status || 'ACTIVE',
                startDate: startDate ? new Date(startDate) : new Date(),
                endDate: endDate ? new Date(endDate) : null,
            },
        });

        const response = successResponse(alert, 201);
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        return response;
    } catch (error: any) {
        console.error('Error creating alert:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create alert', details: error.message } },
            { status: 500 }
        );
    }
}

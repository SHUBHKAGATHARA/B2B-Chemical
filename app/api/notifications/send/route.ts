import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * POST /api/notifications/send
 * Send file upload notification to distributor(s)
 * 
 * This endpoint allows external applications to send notifications
 * when they upload files via the API.
 * 
 * Request Body:
 * {
 *   "distributorIds": ["dist_id_1", "dist_id_2"], // Array of distributor IDs
 *   "pdfId": "pdf_id",                             // PDF upload ID
 *   "apiKey": "your_api_key"                       // API key for authentication
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { distributorIds, pdfId, apiKey } = body;

        // Validate API key (simple validation - you can enhance this)
        const validApiKey = process.env.API_KEY || 'your-secret-api-key';
        if (apiKey !== validApiKey) {
            return NextResponse.json(
                { error: 'Invalid API key' },
                { status: 401 }
            );
        }

        // Validate required fields
        if (!distributorIds || !Array.isArray(distributorIds) || distributorIds.length === 0) {
            return NextResponse.json(
                { error: 'distributorIds array is required' },
                { status: 400 }
            );
        }

        if (!pdfId) {
            return NextResponse.json(
                { error: 'pdfId is required' },
                { status: 400 }
            );
        }

        // Verify PDF exists
        const pdf = await prisma.pdfUpload.findUnique({
            where: { id: pdfId },
            select: { id: true, fileName: true },
        });

        if (!pdf) {
            return NextResponse.json(
                { error: 'PDF not found' },
                { status: 404 }
            );
        }

        // Verify all distributors exist
        const distributors = await prisma.distributor.findMany({
            where: {
                id: { in: distributorIds },
            },
            select: { id: true, name: true },
        });

        if (distributors.length !== distributorIds.length) {
            return NextResponse.json(
                { error: 'One or more distributor IDs are invalid' },
                { status: 400 }
            );
        }

        // Create notifications for each distributor
        const notifications = await Promise.all(
            distributorIds.map((distId) =>
                prisma.notification.create({
                    data: {
                        pdfId,
                        distId,
                        readFlag: false,
                    },
                })
            )
        );

        // Log the action
        await prisma.log.create({
            data: {
                action: `Notifications sent for PDF: ${pdf.fileName}`,
                userId: 'API', // System/API user
            },
        });

        return NextResponse.json({
            success: true,
            message: `Notifications sent to ${notifications.length} distributor(s)`,
            data: {
                notificationCount: notifications.length,
                pdfId,
                pdfFileName: pdf.fileName,
                distributors: distributors.map(d => ({
                    id: d.id,
                    name: d.name,
                })),
            },
        });
    } catch (error: any) {
        console.error('[Notifications] Send error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send notifications' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/notifications/send
 * Get API documentation
 */
export async function GET() {
    return NextResponse.json({
        endpoint: '/api/notifications/send',
        method: 'POST',
        description: 'Send file upload notifications to distributors',
        authentication: 'API Key required in request body',
        requestBody: {
            distributorIds: 'string[] - Array of distributor IDs',
            pdfId: 'string - PDF upload ID',
            apiKey: 'string - Your API key',
        },
        example: {
            distributorIds: ['dist_123', 'dist_456'],
            pdfId: 'pdf_789',
            apiKey: 'your-secret-api-key',
        },
        response: {
            success: true,
            message: 'Notifications sent to N distributor(s)',
            data: {
                notificationCount: 2,
                pdfId: 'pdf_789',
                pdfFileName: 'document.pdf',
                distributors: [
                    { id: 'dist_123', name: 'Distributor A' },
                    { id: 'dist_456', name: 'Distributor B' },
                ],
            },
        },
    });
}

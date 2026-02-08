import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createAlertSchema } from '@/lib/validations/schemas';
import { successResponse } from '@/lib/utils/api-response';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET: Fetch all alerts (admin)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status && ['ACTIVE', 'INACTIVE', 'EXPIRED'].includes(status)) {
            where.status = status;
        }

        const [alerts, total] = await Promise.all([
            prisma.alert.findMany({
                where,
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),
            prisma.alert.count({ where }),
        ]);

        return successResponse({
            alerts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        console.error('Error fetching alerts:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch alerts', details: error.message } },
            { status: 500 }
        );
    }
}

// POST: Create a new alert
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = createAlertSchema.parse(body);

        const alert = await prisma.alert.create({
            data: {
                title: validatedData.title.trim(),
                message: validatedData.message.trim(),
                imageUrl: validatedData.imageUrl && validatedData.imageUrl.trim() ? validatedData.imageUrl.trim() : null,
                buttonText: null,
                buttonAction: null,
                status: validatedData.status || 'ACTIVE',
                startDate: validatedData.startDate
                    ? new Date(validatedData.startDate)
                    : new Date(),
                endDate: validatedData.endDate && validatedData.endDate.trim()
                    ? new Date(validatedData.endDate)
                    : null,
            },
        });

        return successResponse(alert, 201);
    } catch (error: any) {
        console.error('[Alert API] Error creating alert:', error);

        // Handle Zod validation errors
        if (error.name === 'ZodError' || error.errors) {
            const validationErrors = error.errors || error.issues || [];
            const errorMessages = validationErrors.map((err: any) => 
                `${err.path?.join('.') || 'Field'}: ${err.message}`
            ).join(', ');
            
            console.error('[Alert API] Validation error:', errorMessages);
            
            return NextResponse.json(
                { 
                    success: false, 
                    error: { 
                        code: 'VALIDATION_ERROR', 
                        message: errorMessages || 'Validation failed', 
                        details: validationErrors 
                    } 
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create alert: ' + error.message, details: error.message } },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { updateAlertSchema } from '@/lib/validations/schemas';
import { successResponse } from '@/lib/utils/api-response';

// GET: Fetch a single alert by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const alert = await prisma.alert.findUnique({
            where: { id: params.id },
        });

        if (!alert) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Alert not found' } },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: alert,
                meta: { timestamp: new Date().toISOString() }
            }
        );
    } catch (error: any) {
        console.error('Error fetching alert:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch alert', details: error.message } },
            { status: 500 }
        );
    }
}

// PATCH: Update an alert
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const validatedData = updateAlertSchema.parse(body);

        // Check if alert exists
        const existingAlert = await prisma.alert.findUnique({
            where: { id: params.id },
        });

        if (!existingAlert) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Alert not found' } },
                { status: 404 }
            );
        }

        const updateData: any = {};
        if (validatedData.title) updateData.title = validatedData.title.trim();
        if (validatedData.message) updateData.message = validatedData.message.trim();
        if (validatedData.imageUrl !== undefined) {
            updateData.imageUrl = validatedData.imageUrl && validatedData.imageUrl.trim()
                ? validatedData.imageUrl.trim()
                : null;
        }
        if (validatedData.status) updateData.status = validatedData.status;
        if (validatedData.startDate) updateData.startDate = new Date(validatedData.startDate);
        if (validatedData.endDate !== undefined) {
            updateData.endDate = validatedData.endDate && validatedData.endDate.trim()
                ? new Date(validatedData.endDate)
                : null;
        }

        const updatedAlert = await prisma.alert.update({
            where: { id: params.id },
            data: updateData,
        });

        return NextResponse.json(
            {
                success: true,
                data: updatedAlert,
                meta: { timestamp: new Date().toISOString() }
            }
        );
    } catch (error: any) {
        console.error('[Alert API] Error updating alert:', error);

        // Handle Zod validation errors
        if (error.name === 'ZodError' || error.errors) {
            const validationErrors = error.errors || error.issues || [];
            const errorMessages = validationErrors.map((err: any) => 
                `${err.path?.join('.') || 'Field'}: ${err.message}`
            ).join(', ');
            
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
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update alert: ' + error.message, details: error.message } },
            { status: 500 }
        );
    }
}

// DELETE: Delete an alert
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const alert = await prisma.alert.findUnique({
            where: { id: params.id },
        });

        if (!alert) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Alert not found' } },
                { status: 404 }
            );
        }

        await prisma.alert.delete({
            where: { id: params.id },
        });

        return NextResponse.json(
            {
                success: true,
                data: null,
                meta: { timestamp: new Date().toISOString() }
            }
        );
    } catch (error: any) {
        console.error('Error deleting alert:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete alert', details: error.message } },
            { status: 500 }
        );
    }
}

// PUT: Update an alert (alias for PATCH)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return PATCH(request, { params });
}

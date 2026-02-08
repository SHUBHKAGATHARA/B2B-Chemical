import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { updatePdfCategorySchema } from '@/lib/validations/schemas';
import { successResponse } from '@/lib/utils/api-response';

// GET: Fetch a single PDF category by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const category = await prisma.pdfCategory.findUnique({
            where: { id: params.id },
            include: {
                _count: {
                    select: {
                        pdfUploads: true,
                    },
                },
            },
        });

        if (!category) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'PDF category not found' } },
                { status: 404 }
            );
        }

        return NextResponse.json(
            successResponse(category)
        );
    } catch (error: any) {
        console.error('Error fetching PDF category:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch PDF category', details: error.message } },
            { status: 500 }
        );
    }
}

// PATCH: Update a PDF category
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const validatedData = updatePdfCategorySchema.parse(body);

        // Check if category exists
        const existingCategory = await prisma.pdfCategory.findUnique({
            where: { id: params.id },
        });

        if (!existingCategory) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'PDF category not found' } },
                { status: 404 }
            );
        }

        // If name is being updated, check for duplicates
        if (validatedData.name && validatedData.name !== existingCategory.name) {
            const duplicateCategory = await prisma.pdfCategory.findUnique({
                where: { name: validatedData.name },
            });

            if (duplicateCategory) {
                return NextResponse.json(
                    { success: false, error: { code: 'ALREADY_EXISTS', message: 'Category with this name already exists' } },
                    { status: 409 }
                );
            }
        }

        const updatedCategory = await prisma.pdfCategory.update({
            where: { id: params.id },
            data: {
                ...(validatedData.name && { name: validatedData.name.trim() }),
                ...(validatedData.description !== undefined && { 
                    description: validatedData.description?.trim() || null 
                }),
            },
        });

        return NextResponse.json(
            successResponse(updatedCategory)
        );
    } catch (error: any) {
        console.error('Error updating PDF category:', error);
        
        if (error.name === 'ZodError') {
            return NextResponse.json(
                { success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: error.errors } },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update PDF category', details: error.message } },
            { status: 500 }
        );
    }
}

// DELETE: Delete a PDF category
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check if category exists and has associated PDFs
        const category = await prisma.pdfCategory.findUnique({
            where: { id: params.id },
            include: {
                _count: {
                    select: {
                        pdfUploads: true,
                    },
                },
            },
        });

        if (!category) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'PDF category not found' } },
                { status: 404 }
            );
        }

        if (category._count.pdfUploads > 0) {
            return NextResponse.json(
                { success: false, error: { code: 'CONFLICT', message: `Cannot delete category. ${category._count.pdfUploads} PDF(s) are using this category.` } },
                { status: 409 }
            );
        }

        await prisma.pdfCategory.delete({
            where: { id: params.id },
        });

        return NextResponse.json(
            successResponse(null)
        );
    } catch (error: any) {
        console.error('Error deleting PDF category:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete PDF category', details: error.message } },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createPdfCategorySchema } from '@/lib/validations/schemas';
import { successResponse } from '@/lib/utils/api-response';

// GET: Fetch all PDF categories
export async function GET(request: NextRequest) {
    try {
        console.log('[PDF Categories API] Fetching categories...');
        
        let categories = await prisma.pdfCategory.findMany({
            orderBy: {
                name: 'asc',
            },
            include: {
                _count: {
                    select: {
                        pdfUploads: true,
                    },
                },
            },
        });

        console.log(`[PDF Categories API] Found ${categories.length} categories`);

        // If no categories exist, create default ones
        if (categories.length === 0) {
            console.log('[PDF Categories API] No categories found, creating defaults...');
            
            const defaultCategories = [
                { name: 'Technical Documentation', description: 'Technical specifications, manuals, and documentation' },
                { name: 'Reports & Analysis', description: 'Business reports, analytics, and performance reviews' },
                { name: 'Product Catalogs', description: 'Product catalogs, brochures, and marketing materials' },
                { name: 'Contracts & Legal', description: 'Contracts, agreements, and legal documents' },
                { name: 'Invoices & Billing', description: 'Invoices, receipts, and billing statements' },
                { name: 'Training Materials', description: 'Training guides, tutorials, and educational content' },
                { name: 'Safety & Compliance', description: 'Safety data sheets, compliance documents, and certifications' },
                { name: 'Marketing & Promotional', description: 'Marketing materials, promotional content, and advertisements' },
            ];

            // Create all categories
            await Promise.all(
                defaultCategories.map(cat =>
                    prisma.pdfCategory.create({
                        data: cat,
                    })
                )
            );

            console.log(`[PDF Categories API] Created ${defaultCategories.length} default categories`);

            // Fetch again to include the new categories with counts
            categories = await prisma.pdfCategory.findMany({
                orderBy: {
                    name: 'asc',
                },
                include: {
                    _count: {
                        select: {
                            pdfUploads: true,
                        },
                    },
                },
            });
        }

        console.log(`[PDF Categories API] Returning ${categories.length} categories`);
        
        // Convert to plain objects to ensure proper serialization
        const plainCategories = categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            createdAt: cat.createdAt.toISOString(),
            _count: cat._count,
        }));
        
        console.log('[PDF Categories API] Sample category:', plainCategories[0]);
        
        return successResponse(plainCategories);
    } catch (error: any) {
        console.error('[PDF Categories API] Error fetching categories:', error);
        console.error('[PDF Categories API] Error code:', error.code);
        console.error('[PDF Categories API] Error message:', error.message);
        
        // Handle database connection errors specifically
        if (error.code === 'P1001' || error.message?.includes('connect') || error.message?.includes('reach database')) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: { 
                        code: 'DB_CONNECTION_ERROR', 
                        message: 'Unable to connect to database. Please try again in a moment.', 
                        details: 'The database may be sleeping or temporarily unavailable' 
                    } 
                },
                { status: 503 }
            );
        }
        
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch PDF categories', details: error.message } },
            { status: 500 }
        );
    }
}

// POST: Create a new PDF category
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = createPdfCategorySchema.parse(body);

        // Check if category already exists
        const existingCategory = await prisma.pdfCategory.findUnique({
            where: { name: validatedData.name },
        });

        if (existingCategory) {
            return NextResponse.json(
                { success: false, error: { code: 'ALREADY_EXISTS', message: 'Category with this name already exists' } },
                { status: 409 }
            );
        }

        const category = await prisma.pdfCategory.create({
            data: {
                name: validatedData.name.trim(),
                description: validatedData.description?.trim() || null,
            },
        });

        return successResponse(category, 201);
    } catch (error: any) {
        console.error('Error creating PDF category:', error);
        
        if (error.name === 'ZodError') {
            return NextResponse.json(
                { success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: error.errors } },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create PDF category', details: error.message } },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { updateDistributorSchema } from '@/lib/validations/schemas';

// Force dynamic rendering and Node.js runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Get single distributor
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        const { id } = await params;

        const distributor = await prisma.distributor.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        pdfAssignments: true,
                        notifications: true,
                    },
                },
            },
        });

        if (!distributor) {
            return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
        }

        return NextResponse.json({ distributor });
    } catch (error: any) {
        if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update distributor
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireAdmin();
        const { id } = await params;
        const body = await request.json();

        // Validate input
        const validation = updateDistributorSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.errors },
                { status: 400 }
            );
        }

        const data: any = {};
        if (validation.data.companyName) data.companyName = validation.data.companyName;
        if (validation.data.email) data.email = validation.data.email;
        if (validation.data.status) data.status = validation.data.status;

        // Update distributor
        const distributor = await prisma.distributor.update({
            where: { id },
            data,
        });

        // Also update corresponding user if email or status changed
        if (validation.data.email || validation.data.status) {
            const userUpdate: any = {};
            if (validation.data.email) userUpdate.email = validation.data.email;
            if (validation.data.status) userUpdate.status = validation.data.status;
            if (validation.data.companyName) userUpdate.fullName = validation.data.companyName;

            await prisma.user.updateMany({
                where: { email: distributor.email },
                data: userUpdate,
            });
        }

        // Log action
        await prisma.log.create({
            data: {
                action: `Updated distributor: ${distributor.email}`,
                userId: session.userId,
            },
        });

        return NextResponse.json({ distributor });
    } catch (error: any) {
        if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('Update distributor error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete distributor
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireAdmin();
        const { id } = await params;

        const distributor = await prisma.distributor.findUnique({
            where: { id },
            select: { email: true },
        });

        if (!distributor) {
            return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
        }

        // Delete distributor and corresponding user
        await prisma.$transaction(async (tx) => {
            await tx.distributor.delete({ where: { id } });
            await tx.user.deleteMany({ where: { email: distributor.email } });
        });

        // Log action
        await prisma.log.create({
            data: {
                action: `Deleted distributor: ${distributor.email}`,
                userId: session.userId,
            },
        });

        return NextResponse.json({ message: 'Distributor deleted successfully' });
    } catch (error: any) {
        if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('Delete distributor error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

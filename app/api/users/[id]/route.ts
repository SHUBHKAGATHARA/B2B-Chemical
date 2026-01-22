import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { updateUserSchema } from '@/lib/validations/schemas';
import { hashPassword } from '@/lib/auth/jwt';

// Force dynamic rendering and Node.js runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Get single user
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireAdmin();
        const { id } = params;

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                lastLogin: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error: any) {
        if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update user
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requireAdmin();
        const { id } = params;
        const body = await request.json();

        // Validate input
        const validation = updateUserSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.errors },
                { status: 400 }
            );
        }

        const data: any = {};
        if (validation.data.fullName) data.fullName = validation.data.fullName;
        if (validation.data.email) data.email = validation.data.email;
        if (validation.data.role) data.role = validation.data.role;
        if (validation.data.status) data.status = validation.data.status;
        if (validation.data.password && validation.data.password.trim() !== '') {
            data.passwordHash = await hashPassword(validation.data.password);
        }

        // Update user
        const user = await prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                lastLogin: true,
            },
        });

        // Log action
        await prisma.log.create({
            data: {
                action: `Updated user: ${user.email}`,
                userId: session.userId,
            },
        });

        return NextResponse.json({ user });
    } catch (error: any) {
        if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('Update user error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete user
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requireAdmin();
        const { id } = params;

        // Prevent self-deletion
        if (id === session.userId) {
            return NextResponse.json(
                { error: 'Cannot delete your own account' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id },
            select: { email: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Delete user
        await prisma.user.delete({
            where: { id },
        });

        // Log action
        await prisma.log.create({
            data: {
                action: `Deleted user: ${user.email}`,
                userId: session.userId,
            },
        });

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('Delete user error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

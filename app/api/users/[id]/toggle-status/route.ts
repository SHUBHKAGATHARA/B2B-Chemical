import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';

// Force dynamic rendering and Node.js runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// PATCH - Toggle user status (ACTIVE <-> INACTIVE)
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requireAdmin();
        const { id } = params;

        const user = await prisma.user.findUnique({
            where: { id },
            select: { id: true, email: true, status: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { status: newStatus },
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
                action: `Changed user status: ${user.email} -> ${newStatus}`,
                userId: session.userId,
            },
        });

        return NextResponse.json({ user: updatedUser });
    } catch (error: any) {
        if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('Toggle user status error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

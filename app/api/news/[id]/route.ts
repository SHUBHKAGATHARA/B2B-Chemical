
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth/jwt';

// Force dynamic rendering and Node.js runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        await verifyToken(token);

        const { id } = await params;

        await prisma.news.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: 'News deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting news:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        await verifyToken(token);

        const { id } = await params;
        const body = await request.json();

        const news = await prisma.news.update({
            where: { id },
            data: {
                title: body.title,
                content: body.content,
                category: body.category,
                imageUrl: body.imageUrl,
                source: body.source,
                publishDate: body.publishDate ? new Date(body.publishDate) : undefined,
            }
        });

        return NextResponse.json({
            success: true,
            data: news
        });

    } catch (error) {
        console.error('Error updating news:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

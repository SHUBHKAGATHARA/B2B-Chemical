import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

// Force dynamic rendering and Node.js runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/news/[id] — PUBLIC endpoint (no authentication required)
 * Returns a single news article
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const news = await prisma.news.findUnique({
            where: { id },
            include: {
                author: {
                    select: { fullName: true },
                },
            },
        });

        if (!news) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: news,
        });
    } catch (error) {
        console.error('Error fetching news article:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * PUT /api/news/[id] — ADMIN only (editing does NOT create new notifications)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { id } = params;
        const body = await request.json();

        const news = await prisma.news.update({
            where: { id },
            data: {
                title: body.title,
                content: body.content,
                category: body.category,
                imageUrl: body.imageUrl ?? null,
                source: body.source ?? null,
                publishDate: body.publishDate ? new Date(body.publishDate) : undefined,
            },
        });

        return NextResponse.json({
            success: true,
            data: news,
        });
    } catch (error) {
        console.error('Error updating news:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * DELETE /api/news/[id] — ADMIN only
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { id } = params;

        await prisma.news.delete({ where: { id } });

        return NextResponse.json({
            success: true,
            message: 'News deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting news:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

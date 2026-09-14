import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';
import {
    createNewsNotificationsForAll,
    attemptNewsPushNotifications,
} from '@/lib/services/notification-service';

// Force dynamic rendering and Node.js runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Schema for validation
const newsSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    category: z.string().default('General'),
    publishDate: z.string().optional(),
    imageUrl: z.string().optional(),
    source: z.string().optional(),
});

/**
 * GET /api/news — PUBLIC endpoint (no authentication required)
 * Returns published news articles with optional category filter and pagination
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
        const offset = parseInt(searchParams.get('offset') || '0');
        const category = searchParams.get('category');

        // Build where clause
        const where: any = {};
        if (category && category !== 'All') {
            where.category = category;
        }

        const [news, total] = await Promise.all([
            prisma.news.findMany({
                where,
                take: limit,
                skip: offset,
                orderBy: { publishDate: 'desc' },
                include: {
                    author: {
                        select: { fullName: true },
                    },
                },
            }),
            prisma.news.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: news,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total,
            },
        });
    } catch (error) {
        console.error('Error fetching news:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * POST /api/news — ADMIN only
 * Creates a new news article and triggers distributor notifications
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const body = await request.json();

        const result = newsSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation Error', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const data = result.data;

        // Create news article
        const news = await prisma.news.create({
            data: {
                title: data.title,
                content: data.content,
                category: data.category,
                imageUrl: data.imageUrl || null,
                source: data.source || null,
                publishDate: data.publishDate ? new Date(data.publishDate) : new Date(),
                authorId: session.userId,
            },
        });

        // Generate excerpt for notifications (first 150 chars of content)
        const excerpt = data.content.length > 150
            ? data.content.substring(0, 147) + '...'
            : data.content;

        // Create in-app notifications for all active distributors
        // Fire-and-forget pattern: don't fail the news creation if notifications fail
        createNewsNotificationsForAll(news.id, news.title, excerpt).catch((err) => {
            console.error('[News] Failed to create in-app notifications (non-fatal):', err);
        });

        // Attempt push notifications (always non-fatal)
        attemptNewsPushNotifications(news.id, news.title).catch((err) => {
            console.error('[News] Failed to attempt push notifications (non-fatal):', err);
        });

        return NextResponse.json({
            success: true,
            data: news,
        });
    } catch (error) {
        console.error('Error creating news:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

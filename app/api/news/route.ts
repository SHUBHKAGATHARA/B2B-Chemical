
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth/jwt';
import { z } from 'zod';

// Force dynamic rendering and Node.js runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// Schema for validation
const newsSchema = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    category: z.string().default("General"),
    publishDate: z.string().optional(),
    imageUrl: z.string().optional(),
    source: z.string().optional(),
});

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        await verifyToken(token);

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        const news = await prisma.news.findMany({
            take: limit,
            skip: offset,
            orderBy: { publishDate: 'desc' },
            include: {
                author: {
                    select: { fullName: true }
                }
            }
        });

        const total = await prisma.news.count();

        return NextResponse.json({
            success: true,
            data: news,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total
            }
        });

    } catch (error) {
        console.error('Error fetching news:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const payload = await verifyToken(token);

        const body = await request.json();

        // Validate input
        const result = newsSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({
                error: 'Validation Error',
                details: result.error.flatten()
            }, { status: 400 });
        }

        const data = result.data;

        // Create news
        const news = await prisma.news.create({
            data: {
                title: data.title,
                content: data.content,
                category: data.category,
                imageUrl: data.imageUrl,
                source: data.source,
                publishDate: data.publishDate ? new Date(data.publishDate) : new Date(),
                authorId: payload.userId,
            }
        });

        return NextResponse.json({
            success: true,
            data: news
        });

    } catch (error) {
        console.error('Error creating news:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

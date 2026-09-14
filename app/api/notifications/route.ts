import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';
import { getDistributorIdByEmail } from '@/lib/cache/distributor-cache';
import {
    paginatedResponse,
    ErrorResponses,
    handleApiError,
} from '@/lib/utils/api-response';
import {
    parsePaginationParams,
    parseSortParams,
    buildOrderBy,
    buildPaginationMeta,
    parseDateRangeParams,
} from '@/lib/utils/pagination';
import { NotificationType } from '@prisma/client';

// Force dynamic rendering and Node.js runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - List notifications for current user (distributors only; admins get empty list)
export async function GET(request: NextRequest) {
    try {
        const session = await requireAuth();

        // Admins don't have notifications — return empty list gracefully
        if (session.role === 'ADMIN') {
            return NextResponse.json({
                success: true,
                data: [],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrev: false,
                    unreadCount: 0,
                },
            });
        }

        // Get distributor ID with caching for faster lookups
        const distributorId = await getDistributorIdByEmail(session.email);

        if (!distributorId) {
            return ErrorResponses.notFound('Distributor');
        }

        const { searchParams } = new URL(request.url);

        // Parse pagination
        const { page, limit, skip } = parsePaginationParams(searchParams, 20, 50);

        // Parse sorting
        const sortParams = parseSortParams(
            searchParams,
            ['createdAt', 'readFlag'],
            'createdAt',
            'desc'
        );

        // Parse date range
        const dateRange = parseDateRangeParams(searchParams, 'createdAt');

        // Build where clause
        const where: any = {
            distId: distributorId,
        };

        // Filter by read/unread
        const readFlagParam = searchParams.get('readFlag');
        if (readFlagParam === 'true') where.readFlag = true;
        if (readFlagParam === 'false') where.readFlag = false;

        // Filter by notification type: ?type=PDF|NEWS|SYSTEM
        const typeParam = searchParams.get('type');
        if (typeParam && Object.values(NotificationType).includes(typeParam as NotificationType)) {
            where.type = typeParam as NotificationType;
        }

        // Add date range
        if (dateRange) {
            where.createdAt = dateRange;
        }

        // Execute query
        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                skip,
                take: limit,
                include: {
                    pdf: {
                        select: {
                            id: true,
                            fileName: true,
                            createdAt: true,
                            categoryId: true,
                            category: {
                                select: { name: true },
                            },
                            uploadedBy: {
                                select: { fullName: true },
                            },
                        },
                    },
                    news: {
                        select: {
                            id: true,
                            title: true,
                            category: true,
                            imageUrl: true,
                            publishDate: true,
                        },
                    },
                },
                orderBy: buildOrderBy(sortParams),
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({
                where: {
                    distId: distributorId,
                    readFlag: false,
                },
            }),
        ]);

        // Map to DTOs
        const notificationDTOs = notifications.map((notif) => ({
            id: notif.id,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            readFlag: notif.readFlag,
            createdAt: notif.createdAt.toISOString(),
            pdfId: notif.pdfId || null,
            newsId: notif.newsId || null,
            // Backward-compatible pdf field (may be null for NEWS notifications)
            pdf: notif.pdf
                ? {
                      id: notif.pdf.id,
                      fileName: notif.pdf.fileName,
                      createdAt: notif.pdf.createdAt.toISOString(),
                      uploadedByName: notif.pdf.uploadedBy?.fullName || 'Unknown',
                      categoryName: notif.pdf.category?.name || null,
                  }
                : null,
            news: notif.news
                ? {
                      id: notif.news.id,
                      title: notif.news.title,
                      category: notif.news.category,
                      imageUrl: notif.news.imageUrl || null,
                      publishDate: notif.news.publishDate.toISOString(),
                  }
                : null,
        }));

        // Build pagination metadata with unread count
        const paginationMeta = buildPaginationMeta(page, limit, total);

        return paginatedResponse(notificationDTOs, {
            ...paginationMeta,
            total,
            unreadCount,
        } as any);
    } catch (error: any) {
        return handleApiError(error);
    }
}

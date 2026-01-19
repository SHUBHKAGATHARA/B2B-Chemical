import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireDistributor } from '@/lib/auth/session';
import { toNotificationDTO } from '@/lib/mappers';
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
    parseFilterParams,
    parseDateRangeParams,
} from '@/lib/utils/pagination';

// Force Node.js runtime (bcryptjs not compatible with Edge Runtime)
export const runtime = 'nodejs';


// GET - List notifications for current distributor with pagination and filtering
export async function GET(request: NextRequest) {
    try {
        const session = await requireDistributor();

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

        // Parse filters
        const filters = parseFilterParams(searchParams, ['readFlag']);

        // Parse date range
        const dateRange = parseDateRangeParams(searchParams, 'createdAt');

        // Build where clause
        const where: any = {
            distId: distributorId,
            ...filters,
        };

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
                            uploadedBy: {
                                select: {
                                    fullName: true,
                                },
                            },
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
        const notificationDTOs = notifications.map((notif) =>
            toNotificationDTO(notif as any)
        );

        // Build pagination metadata with unread count
        const paginationMeta = buildPaginationMeta(page, limit, total);

        return paginatedResponse(notificationDTOs, {
            ...paginationMeta,
            // Add unread count to pagination meta for mobile convenience
            total: total,
            unreadCount,
        } as any);
    } catch (error: any) {
        return handleApiError(error);
    }
}

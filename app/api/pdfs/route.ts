import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, getSession } from '@/lib/auth/session';
import { toPdfListItemDTO } from '@/lib/mappers';
import { getDistributorIdByEmail } from '@/lib/cache/distributor-cache';
import {
    paginatedResponse,
    ErrorResponses,
    handleApiError,
} from '@/lib/utils/api-response';
import {
    parsePaginationParams,
    parseSortParams,
    parseSearchParam,
    buildTextSearchFilter,
    buildOrderBy,
    buildPaginationMeta,
    parseFilterParams,
    parseDateRangeParams,
} from '@/lib/utils/pagination';

// Force dynamic rendering and Node.js runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// GET - List PDFs with pagination, filtering, and search (Admin and Distributors)
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return ErrorResponses.unauthorized();
        }

        const { searchParams } = new URL(request.url);

        // Parse pagination
        const { page, limit, skip } = parsePaginationParams(searchParams);

        // Parse sorting
        const sortParams = parseSortParams(
            searchParams,
            ['fileName', 'createdAt', 'status', 'assignedGroup'],
            'createdAt',
            'desc'
        );

        // Parse filters
        const filters = parseFilterParams(searchParams, ['status', 'assignedGroup']);

        // Parse search
        const search = parseSearchParam(searchParams);

        // Parse date range
        const dateRange = parseDateRangeParams(searchParams, 'createdAt');

        // Build base where clause based on role
        let where: any = { ...filters };

        // Distributors can only see their assigned PDFs
        if (session.role === 'DISTRIBUTOR') {
            // Get distributor ID with caching
            const distributorId = await getDistributorIdByEmail(session.email);

            if (!distributorId) {
                return paginatedResponse([], buildPaginationMeta(page, limit, 0));
            }

            // Get all PDF IDs that have notifications for this distributor
            const notifications = await prisma.notification.findMany({
                where: { distId: distributorId },
                select: { pdfId: true },
            });
            const notifiedPdfIds = notifications.map(n => n.pdfId);

            // Distributor can see PDFs that:
            // 1. Are directly assigned to them (assignedDistributorId)
            // 2. Are assigned to ALL distributors
            // 3. Have a notification for them (for MULTIPLE assignments)
            where.OR = [
                { assignedDistributorId: distributorId },
                { assignedGroup: 'ALL' },
                { id: { in: notifiedPdfIds } },
            ];
        }

        // Add text search
        const textSearch = buildTextSearchFilter(search, ['fileName']);
        if (textSearch) {
            where.AND = where.AND || [];
            where.AND.push(textSearch);
        }

        // Add date range
        if (dateRange) {
            where.createdAt = dateRange;
        }

        // Execute query with minimal joins
        const [pdfs, total] = await Promise.all([
            prisma.pdfUpload.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    fileName: true,
                    assignedGroup: true,
                    status: true,
                    createdAt: true,
                    uploadedBy: {
                        select: {
                            fullName: true,
                        },
                    },
                    distributor: {
                        select: {
                            companyName: true,
                        },
                    },
                },
                orderBy: buildOrderBy(sortParams),
            }),
            prisma.pdfUpload.count({ where }),
        ]);

        // Map to DTOs (lightweight for mobile)
        const pdfDTOs = pdfs.map((pdf) => toPdfListItemDTO(pdf as any));

        // Build pagination metadata
        const paginationMeta = buildPaginationMeta(page, limit, total);

        return paginatedResponse(pdfDTOs, paginationMeta);
    } catch (error: any) {
        console.error('Get PDFs error:', error);
        return handleApiError(error);
    }
}

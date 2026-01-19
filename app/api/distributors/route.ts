import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { createDistributorSchema } from '@/lib/validations/schemas';
import { hashPassword } from '@/lib/auth/jwt';
import { toDistributorListItemDTO, toDistributorDTO } from '@/lib/mappers';
import {
    successResponse,
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
} from '@/lib/utils/pagination';

// GET - List all distributors with pagination, filtering, and search (Admin only)
export async function GET(request: NextRequest) {
    try {
        await requireAdmin();

        const { searchParams } = new URL(request.url);

        // Parse pagination
        const { page, limit, skip } = parsePaginationParams(searchParams);

        // Parse sorting
        const sortParams = parseSortParams(
            searchParams,
            ['companyName', 'email', 'createdAt', 'status'],
            'createdAt',
            'desc'
        );

        // Parse filters
        const filters = parseFilterParams(searchParams, ['status']);

        // Parse search
        const search = parseSearchParam(searchParams);

        // Build where clause
        const where: any = { ...filters };
        const textSearch = buildTextSearchFilter(search, ['companyName', 'email']);
        if (textSearch) {
            where.AND = [textSearch];
        }

        // Execute query
        const [distributors, total] = await Promise.all([
            prisma.distributor.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    companyName: true,
                    email: true,
                    status: true,
                    createdAt: true,
                    _count: {
                        select: {
                            pdfAssignments: true,
                            notifications: true,
                        },
                    },
                },
                orderBy: buildOrderBy(sortParams),
            }),
            prisma.distributor.count({ where }),
        ]);

        // Map to DTOs
        const distributorDTOs = distributors.map((dist) =>
            toDistributorListItemDTO(dist as any)
        );

        // Build pagination metadata
        const paginationMeta = buildPaginationMeta(page, limit, total);

        return paginatedResponse(distributorDTOs, paginationMeta);
    } catch (error: any) {
        return handleApiError(error);
    }
}

// POST - Create new distributor (Admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await requireAdmin();
        const body = await request.json();

        // Validate input
        const validation = createDistributorSchema.safeParse(body);
        if (!validation.success) {
            return ErrorResponses.validation(
                'Invalid input',
                validation.error.errors,
                validation.error.errors[0]?.path[0]?.toString()
            );
        }

        const { companyName, email, password, status } = validation.data;

        // Check if email already exists
        const existingDistributor = await prisma.distributor.findUnique({
            where: { email },
        });

        if (existingDistributor) {
            return ErrorResponses.alreadyExists('Distributor with this email');
        }

        // Create distributor and corresponding user in a transaction
        const passwordHash = await hashPassword(password);

        const result = await prisma.$transaction(async (tx) => {
            // Create distributor record
            const distributor = await tx.distributor.create({
                data: {
                    companyName,
                    email,
                    status: status || 'ACTIVE',
                },
                include: {
                    _count: {
                        select: {
                            pdfAssignments: true,
                            notifications: true,
                        },
                    },
                },
            });

            // Create corresponding user account
            await tx.user.create({
                data: {
                    fullName: companyName,
                    email,
                    passwordHash,
                    role: 'DISTRIBUTOR',
                    status: status || 'ACTIVE',
                },
            });

            return distributor;
        });

        // Log action
        await prisma.log.create({
            data: {
                action: `Created distributor: ${result.email} (${result.companyName})`,
                userId: session.userId,
            },
        });

        // Return DTO
        return successResponse({ distributor: toDistributorDTO(result as any) }, 201);
    } catch (error: any) {
        return handleApiError(error);
    }
}

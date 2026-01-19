import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { createUserSchema } from '@/lib/validations/schemas';
import { hashPassword } from '@/lib/auth/jwt';
import { toUserListItemDTO, toUserDTO } from '@/lib/mappers';
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

// Force Node.js runtime (bcryptjs not compatible with Edge Runtime)
export const runtime = 'nodejs';


// GET - List all users with pagination, filtering, and search (Admin only)
export async function GET(request: NextRequest) {
    try {
        await requireAdmin();

        const { searchParams } = new URL(request.url);

        // Parse pagination
        const { page, limit, skip } = parsePaginationParams(searchParams);

        // Parse sorting
        const sortParams = parseSortParams(
            searchParams,
            ['fullName', 'email', 'createdAt', 'lastLogin', 'role', 'status'],
            'createdAt',
            'desc'
        );

        // Parse filters
        const filters = parseFilterParams(searchParams, ['role', 'status']);

        // Parse search
        const search = parseSearchParam(searchParams);

        // Build where clause
        const where: any = { ...filters };
        const textSearch = buildTextSearchFilter(search, ['fullName', 'email']);
        if (textSearch) {
            where.AND = [textSearch];
        }

        // Execute query
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true,
                    status: true,
                    createdAt: true,
                    lastLogin: true,
                    passwordHash: false, // Explicitly exclude
                },
                orderBy: buildOrderBy(sortParams),
            }),
            prisma.user.count({ where }),
        ]);

        // Map to DTOs
        const userDTOs = users.map((user) => toUserListItemDTO(user as any));

        // Build pagination metadata
        const paginationMeta = buildPaginationMeta(page, limit, total);

        return paginatedResponse(userDTOs, paginationMeta);
    } catch (error: any) {
        return handleApiError(error);
    }
}

// POST - Create new user (Admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await requireAdmin();
        const body = await request.json();

        // Validate input
        const validation = createUserSchema.safeParse(body);
        if (!validation.success) {
            return ErrorResponses.validation(
                'Invalid input',
                validation.error.errors,
                validation.error.errors[0]?.path[0]?.toString()
            );
        }

        const { fullName, email, password, role, status } = validation.data;

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return ErrorResponses.alreadyExists('User with this email');
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const user = await prisma.user.create({
            data: {
                fullName,
                email,
                passwordHash,
                role,
                status: status || 'ACTIVE',
            },
        });

        // Log action
        await prisma.log.create({
            data: {
                action: `Created user: ${user.email} (${user.role})`,
                userId: session.userId,
            },
        });

        // Return DTO
        return successResponse({ user: toUserDTO(user) }, 201);
    } catch (error: any) {
        return handleApiError(error);
    }
}

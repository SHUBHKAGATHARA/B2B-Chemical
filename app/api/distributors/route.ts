import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { createDistributorSchema } from '@/lib/validations/schemas';
import { hashPassword } from '@/lib/auth/jwt';
import { toDistributorListItemDTO, toDistributorDTO } from '@/lib/mappers';
import { uploadToCloudinary, validateImageFile, deleteFromCloudinary, extractPublicId } from '@/lib/cloudinary';
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
                    logoUrl: true,
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

// POST - Create new distributor with logo upload (Admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await requireAdmin();

        // Parse form data (supports both JSON and multipart/form-data)
        const contentType = request.headers.get('content-type') || '';
        let formData: FormData | null = null;
        let body: any = {};
        let logoFile: File | null = null;

        if (contentType.includes('multipart/form-data')) {
            formData = await request.formData();

            // Extract fields from form data
            body = {
                companyName: formData.get('companyName'),
                email: formData.get('email'),
                password: formData.get('password'),
                status: formData.get('status') || 'ACTIVE',
            };

            // Extract logo file if present
            const logo = formData.get('logo');
            console.log('[Distributor API POST] Logo from formData:', logo);
            if (logo && logo instanceof File && logo.size > 0) {
                logoFile = logo;
                console.log('[Distributor API POST] Logo file detected:', {
                    name: logoFile.name,
                    size: logoFile.size,
                    type: logoFile.type
                });
            } else if (logo) {
                console.log('[Distributor API POST] Logo found but invalid:', {
                    isFile: logo instanceof File,
                    size: logo instanceof File ? logo.size : 'N/A'
                });
            }
        } else {
            // Handle JSON request
            body = await request.json();
        }

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

        // Validate logo file if provided
        if (logoFile) {
            const validation = validateImageFile(logoFile, 5);
            if (!validation.valid) {
                return ErrorResponses.badRequest(validation.error || 'Invalid logo file');
            }
        }

        // Check if email already exists
        const existingDistributor = await prisma.distributor.findUnique({
            where: { email },
        });

        if (existingDistributor) {
            return ErrorResponses.alreadyExists('Distributor with this email');
        }

        // Upload logo to Cloudinary if provided
        let logoUrl: string | undefined;
        if (logoFile) {
            console.log('[Distributor API POST] Starting Cloudinary upload for file:', logoFile.name);
            try {
                const uploadResult = await uploadToCloudinary(logoFile, 'distributor-logos');
                logoUrl = uploadResult.secure_url;
                console.log('[Distributor API POST] Cloudinary upload successful:', logoUrl);
            } catch (error) {
                console.error('[Distributor API POST] Logo upload failed:', error);
                return ErrorResponses.badRequest('Failed to upload logo: ' + (error instanceof Error ? error.message : 'Unknown error'));
            }
        } else {
            console.log('[Distributor API POST] No logo file to upload');
        }

        // Create distributor and corresponding user in a transaction
        const passwordHash = await hashPassword(password);
        
        console.log('[Distributor API POST] Creating distributor with data:', {
            companyName,
            email,
            hasLogoUrl: !!logoUrl,
            logoUrl: logoUrl,
            status: status || 'ACTIVE'
        });

        const result = await prisma.$transaction(async (tx) => {
            // Create distributor record
            const distributor = await tx.distributor.create({
                data: {
                    companyName,
                    email,
                    logoUrl,
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
                action: `Created distributor: ${result.email} (${result.companyName})${logoUrl ? ' with logo' : ''}`,
                userId: session.userId,
            },
        });

        // Return DTO
        return successResponse({ distributor: toDistributorDTO(result as any) }, 201);
    } catch (error: any) {
        return handleApiError(error);
    }
}

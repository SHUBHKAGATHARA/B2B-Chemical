// Pagination and Filtering Utilities
// Provides reusable pagination, sorting, and filtering logic

import { PaginationMeta } from '@/lib/types/dto';

export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
}

export interface SortParams {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
    [key: string]: any;
}

/**
 * Parse and validate pagination parameters from URL search params
 */
export function parsePaginationParams(
    searchParams: URLSearchParams,
    defaultLimit: number = 10,
    maxLimit: number = 100
): PaginationParams {
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    let limit = parseInt(searchParams.get('limit') || defaultLimit.toString(), 10);

    // Enforce max limit
    limit = Math.min(Math.max(1, limit), maxLimit);

    const skip = (page - 1) * limit;

    return { page, limit, skip };
}

/**
 * Parse sorting parameters from URL search params
 */
export function parseSortParams(
    searchParams: URLSearchParams,
    allowedFields: string[] = [],
    defaultSortBy?: string,
    defaultSortOrder: 'asc' | 'desc' = 'desc'
): SortParams {
    const sortBy = searchParams.get('sortBy') || defaultSortBy;
    const sortOrder = (searchParams.get('sortOrder') || defaultSortOrder) as 'asc' | 'desc';

    // Validate sort field if allowedFields is provided
    if (allowedFields.length > 0 && sortBy && !allowedFields.includes(sortBy)) {
        return {
            sortBy: defaultSortBy,
            sortOrder: defaultSortOrder,
        };
    }

    return {
        sortBy,
        sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
    };
}

/**
 * Build Prisma orderBy object from sort params
 */
export function buildOrderBy(sortParams: SortParams): any {
    if (!sortParams.sortBy) {
        return undefined;
    }

    return {
        [sortParams.sortBy]: sortParams.sortOrder,
    };
}

/**
 * Build pagination metadata object
 */
export function buildPaginationMeta(
    page: number,
    limit: number,
    total: number
): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
}

/**
 * Parse search query parameter
 */
export function parseSearchParam(searchParams: URLSearchParams): string | null {
    const search = searchParams.get('search');
    return search && search.trim().length > 0 ? search.trim() : null;
}

/**
 * Build text search filter for multiple fields (case-insensitive)
 */
export function buildTextSearchFilter(
    searchTerm: string | null,
    fields: string[]
): any {
    if (!searchTerm) {
        return undefined;
    }

    return {
        OR: fields.map((field) => ({
            [field]: {
                contains: searchTerm,
                mode: 'insensitive',
            },
        })),
    };
}

/**
 * Parse filter parameters from URL search params
 * Supports enum filters, status filters, etc.
 */
export function parseFilterParams(
    searchParams: URLSearchParams,
    allowedFilters: string[] = []
): FilterParams {
    const filters: FilterParams = {};

    allowedFilters.forEach((filter) => {
        const value = searchParams.get(filter);
        if (value) {
            filters[filter] = value;
        }
    });

    return filters;
}

/**
 * Parse date range filter from URL search params
 */
export function parseDateRangeParams(
    searchParams: URLSearchParams,
    fieldName: string = 'createdAt'
): { gte?: Date; lte?: Date } | undefined {
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate && !endDate) {
        return undefined;
    }

    const filter: any = {};

    if (startDate) {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) {
            filter.gte = start;
        }
    }

    if (endDate) {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
            // Set to end of day
            end.setHours(23, 59, 59, 999);
            filter.lte = end;
        }
    }

    return Object.keys(filter).length > 0 ? filter : undefined;
}

/**
 * Build Prisma where clause combining filters
 */
export function buildWhereClause(
    baseFilters: any = {},
    textSearchFilter?: any,
    dateRangeFilter?: any,
    customFilters?: any
): any {
    const where: any = { ...baseFilters };

    // Add text search
    if (textSearchFilter) {
        where.AND = where.AND || [];
        where.AND.push(textSearchFilter);
    }

    // Add date range
    if (dateRangeFilter) {
        const dateField = Object.keys(dateRangeFilter)[0] || 'createdAt';
        where[dateField] = dateRangeFilter[dateField];
    }

    // Add custom filters
    if (customFilters) {
        Object.assign(where, customFilters);
    }

    return where;
}

/**
 * Cursor-based pagination helper (for future use)
 */
export interface CursorPaginationParams {
    cursor?: string;
    take: number;
}

export function parseCursorPaginationParams(
    searchParams: URLSearchParams,
    defaultTake: number = 20,
    maxTake: number = 100
): CursorPaginationParams {
    const cursor = searchParams.get('cursor') || undefined;
    let take = parseInt(searchParams.get('take') || defaultTake.toString(), 10);

    // Enforce max take
    take = Math.min(Math.max(1, take), maxTake);

    return { cursor, take };
}

// Standardized API Response Utilities
// Provides consistent response format for all API endpoints

import { NextResponse } from 'next/server';
import { ApiResponse, ApiError, PaginatedResponse, PaginationMeta } from '@/lib/types/dto';

/**
 * Generate a unique request ID for tracking
 */
function generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a successful API response
 */
export function successResponse<T>(
    data: T,
    status: number = 200,
    includeRequestId: boolean = false
): NextResponse<ApiResponse<T>> {
    const response: ApiResponse<T> = {
        success: true,
        data,
        meta: {
            timestamp: new Date().toISOString(),
            ...(includeRequestId && { requestId: generateRequestId() }),
        },
    };

    return NextResponse.json(response, { status });
}

/**
 * Create a paginated API response
 */
export function paginatedResponse<T>(
    data: T[],
    pagination: PaginationMeta,
    status: number = 200
): NextResponse<PaginatedResponse<T>> {
    const response: PaginatedResponse<T> = {
        success: true,
        data,
        pagination,
        meta: {
            timestamp: new Date().toISOString(),
        },
    };

    return NextResponse.json(response, { status });
}

/**
 * Error codes for consistent error handling
 */
export const ErrorCodes = {
    // Authentication & Authorization
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    INVALID_TOKEN: 'INVALID_TOKEN',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',

    // Validation
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',
    MISSING_FIELD: 'MISSING_FIELD',

    // Resource Errors
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    CONFLICT: 'CONFLICT',

    // Server Errors
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',

    // Business Logic
    OPERATION_FAILED: 'OPERATION_FAILED',
    INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
} as const;

/**
 * Create an error API response
 */
export function errorResponse(
    code: string,
    message: string,
    status: number = 400,
    details?: any,
    field?: string
): NextResponse<ApiError> {
    const response: ApiError = {
        success: false,
        error: {
            code,
            message,
            ...(details && { details }),
            ...(field && { field }),
        },
        meta: {
            timestamp: new Date().toISOString(),
            requestId: generateRequestId(),
        },
    };

    return NextResponse.json(response, { status });
}

/**
 * Quick error response helpers
 */
export const ErrorResponses = {
    unauthorized: (message: string = 'Unauthorized') =>
        errorResponse(ErrorCodes.UNAUTHORIZED, message, 401),

    forbidden: (message: string = 'Forbidden - Insufficient permissions') =>
        errorResponse(ErrorCodes.FORBIDDEN, message, 403),

    notFound: (resource: string = 'Resource') =>
        errorResponse(ErrorCodes.NOT_FOUND, `${resource} not found`, 404),

    validation: (message: string, details?: any, field?: string) =>
        errorResponse(ErrorCodes.VALIDATION_ERROR, message, 400, details, field),

    alreadyExists: (resource: string = 'Resource') =>
        errorResponse(ErrorCodes.ALREADY_EXISTS, `${resource} already exists`, 400),

    internalError: (message: string = 'Internal server error') =>
        errorResponse(ErrorCodes.INTERNAL_ERROR, message, 500),

    invalidCredentials: () =>
        errorResponse(ErrorCodes.INVALID_CREDENTIALS, 'Invalid email or password', 401),

    accountInactive: () =>
        errorResponse(
            ErrorCodes.ACCOUNT_INACTIVE,
            'Account is inactive. Please contact administrator.',
            403
        ),

    invalidToken: () =>
        errorResponse(ErrorCodes.INVALID_TOKEN, 'Invalid or expired token', 401),
};

/**
 * Handle Prisma or database errors
 */
export function handleDatabaseError(error: any): NextResponse<ApiError> {
    console.error('Database error:', error);

    // Check for common Prisma errors
    if (error.code === 'P2002') {
        return ErrorResponses.alreadyExists('Record with unique field');
    }

    if (error.code === 'P2025') {
        return ErrorResponses.notFound();
    }

    return ErrorResponses.internalError('Database operation failed');
}

/**
 * Handle generic API errors with proper categorization
 */
export function handleApiError(error: any): NextResponse<ApiError> {
    // Handle custom thrown errors
    if (error.message) {
        if (error.message.includes('Unauthorized')) {
            return ErrorResponses.unauthorized(error.message);
        }
        if (error.message.includes('Forbidden')) {
            return ErrorResponses.forbidden(error.message);
        }
        if (error.message.includes('Not found')) {
            return ErrorResponses.notFound();
        }
    }

    // Default to internal error
    console.error('API error:', error);
    return ErrorResponses.internalError();
}

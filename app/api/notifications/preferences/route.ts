import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import {
    getNotificationPreferences,
    updateNotificationPreferences,
} from '@/lib/services/notification-service';
import { notificationPreferencesSchema } from '@/lib/validations/schemas';
import {
    successResponse,
    ErrorResponses,
    handleApiError,
} from '@/lib/utils/api-response';

// GET - Get notification preferences for current user
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return ErrorResponses.unauthorized();
        }

        const preferences = await getNotificationPreferences(session.userId);

        return successResponse({ preferences });
    } catch (error) {
        return handleApiError(error);
    }
}

// PUT - Update notification preferences for current user
export async function PUT(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return ErrorResponses.unauthorized();
        }

        const body = await request.json();

        // Validate input
        const validation = notificationPreferencesSchema.safeParse(body);
        if (!validation.success) {
            return ErrorResponses.validation(
                'Invalid preferences',
                validation.error.errors
            );
        }

        const updatedPreferences = await updateNotificationPreferences(
            session.userId,
            validation.data
        );

        return successResponse({ preferences: updatedPreferences });
    } catch (error) {
        return handleApiError(error);
    }
}

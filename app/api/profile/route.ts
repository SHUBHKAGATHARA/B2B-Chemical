import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth/jwt';
import { uploadToCloudinary, validateImageFile, deleteFromCloudinary, extractPublicId } from '@/lib/cloudinary';

/**
 * GET /api/profile
 * Get current user's profile information
 */
export async function GET(request: NextRequest) {
    try {
        const session = await requireAuth();

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                status: true,
                profilePicture: true,
                createdAt: true,
                lastLogin: true,
                notificationPreferences: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: user,
        });
    } catch (error: any) {
        console.error('[Profile] GET error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch profile' },
            { status: error.message?.includes('Unauthorized') ? 401 : 500 }
        );
    }
}

/**
 * PUT /api/profile
 * Update current user's profile information (supports both JSON and FormData)
 */
export async function PUT(request: NextRequest) {
    try {
        const session = await requireAuth();
        const contentType = request.headers.get('content-type') || '';

        let fullName: string;
        let email: string;
        let currentPassword: string | undefined;
        let newPassword: string | undefined;
        let notificationPreferences: any;
        let profilePictureFile: File | null = null;

        // Handle both FormData (for file uploads) and JSON
        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            fullName = formData.get('fullName') as string;
            email = formData.get('email') as string;
            currentPassword = formData.get('currentPassword') as string | undefined;
            newPassword = formData.get('newPassword') as string | undefined;
            const notifPrefs = formData.get('notificationPreferences') as string;
            notificationPreferences = notifPrefs ? JSON.parse(notifPrefs) : undefined;
            profilePictureFile = formData.get('profilePicture') as File | null;
        } else {
            const body = await request.json();
            fullName = body.fullName;
            email = body.email;
            currentPassword = body.currentPassword;
            newPassword = body.newPassword;
            notificationPreferences = body.notificationPreferences;
        }

        // Validate required fields
        if (!fullName || !email) {
            return NextResponse.json(
                { error: 'Full name and email are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Check if email is already taken by another user
        const existingUser = await prisma.user.findFirst({
            where: {
                email,
                NOT: { id: session.userId },
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email is already in use by another account' },
                { status: 400 }
            );
        }

        // Prepare update data
        const updateData: any = {
            fullName,
            email,
        };

        // Handle notification preferences if provided
        if (notificationPreferences !== undefined) {
            updateData.notificationPreferences = notificationPreferences;
        }

        // Handle profile picture upload if provided
        if (profilePictureFile && profilePictureFile.size > 0) {
            // Validate image file
            const validation = validateImageFile(profilePictureFile, 5);
            if (!validation.valid) {
                return NextResponse.json(
                    { error: validation.error },
                    { status: 400 }
                );
            }

            try {
                // Get current user to check for existing profile picture
                const currentUser = await prisma.user.findUnique({
                    where: { id: session.userId },
                    select: { profilePicture: true },
                });

                // Upload new profile picture to Cloudinary
                const uploadResult = await uploadToCloudinary(profilePictureFile, 'profile-pictures');
                updateData.profilePicture = uploadResult.secure_url;

                // Delete old profile picture if exists
                if (currentUser?.profilePicture) {
                    const oldPublicId = extractPublicId(currentUser.profilePicture);
                    if (oldPublicId) {
                        try {
                            await deleteFromCloudinary(oldPublicId);
                        } catch (deleteError) {
                            console.error('[Profile] Failed to delete old profile picture:', deleteError);
                            // Continue even if delete fails
                        }
                    }
                }
            } catch (uploadError: any) {
                console.error('[Profile] Profile picture upload failed:', uploadError);
                return NextResponse.json(
                    { error: 'Failed to upload profile picture' },
                    { status: 500 }
                );
            }
        }

        // Handle password change if requested
        if (newPassword && newPassword.trim() !== '') {
            // Verify current password if changing password
            if (!currentPassword) {
                return NextResponse.json(
                    { error: 'Current password is required to set a new password' },
                    { status: 400 }
                );
            }

            // Get user with password hash
            const userWithPassword = await prisma.user.findUnique({
                where: { id: session.userId },
                select: { passwordHash: true },
            });

            if (!userWithPassword) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            // Verify current password
            const bcrypt = require('bcryptjs');
            const isValidPassword = await bcrypt.compare(
                currentPassword,
                userWithPassword.passwordHash
            );

            if (!isValidPassword) {
                return NextResponse.json(
                    { error: 'Current password is incorrect' },
                    { status: 400 }
                );
            }

            // Validate new password strength
            if (newPassword.length < 6) {
                return NextResponse.json(
                    { error: 'New password must be at least 6 characters long' },
                    { status: 400 }
                );
            }

            // Hash new password
            updateData.passwordHash = await hashPassword(newPassword);
        }

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { id: session.userId },
            data: updateData,
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                status: true,
                profilePicture: true,
                createdAt: true,
                lastLogin: true,
                notificationPreferences: true,
            },
        });

        // Log the action
        await prisma.log.create({
            data: {
                action: 'Profile updated',
                userId: session.userId,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser,
        });
    } catch (error: any) {
        console.error('[Profile] PUT error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update profile' },
            { status: error.message?.includes('Unauthorized') ? 401 : 500 }
        );
    }
}

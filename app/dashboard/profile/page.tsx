'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Mail, Lock, Bell, Save, AlertCircle, CheckCircle, Eye, EyeOff, Upload, Camera } from 'lucide-react';

interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    role: string;
    status: string;
    profilePicture: string | null;
    createdAt: string;
    lastLogin: string | null;
    notificationPreferences: any;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
    const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [notificationSettings, setNotificationSettings] = useState({
        inApp: true,
        email: true,
        push: false,
    });

    // Fetch user profile
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/profile');

            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }

            const data = await response.json();
            setProfile(data.data);
            setFormData({
                fullName: data.data.fullName || '',
                email: data.data.email || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });

            // Set notification preferences if available
            if (data.data.notificationPreferences) {
                setNotificationSettings({
                    inApp: data.data.notificationPreferences.inApp ?? true,
                    email: data.data.notificationPreferences.email ?? true,
                    push: data.data.notificationPreferences.push ?? false,
                });
            }

            // Set profile picture preview
            if (data.data.profilePicture) {
                setProfilePicturePreview(data.data.profilePicture);
            }
        } catch (err: any) {
            console.error('Fetch error:', err);
            setError(err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError('Invalid file type. Only PNG, JPG, JPEG, and WEBP are allowed.');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size exceeds 5MB limit.');
            return;
        }

        setProfilePictureFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setProfilePicturePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        setError(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNotificationChange = (key: string) => {
        setNotificationSettings(prev => ({
            ...prev,
            [key]: !prev[key as keyof typeof prev],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.fullName || !formData.email) {
            setError('Please fill in all required fields');
            return;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Validate password change if requested
        if (formData.newPassword) {
            if (!formData.currentPassword) {
                setError('Please enter your current password to change it');
                return;
            }

            if (formData.newPassword.length < 6) {
                setError('New password must be at least 6 characters long');
                return;
            }

            if (formData.newPassword !== formData.confirmPassword) {
                setError('New passwords do not match');
                return;
            }
        }

        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            let response;

            // Use FormData if profile picture is being uploaded
            if (profilePictureFile) {
                const formDataToSend = new FormData();
                formDataToSend.append('fullName', formData.fullName);
                formDataToSend.append('email', formData.email);
                formDataToSend.append('notificationPreferences', JSON.stringify(notificationSettings));

                if (formData.newPassword) {
                    formDataToSend.append('currentPassword', formData.currentPassword);
                    formDataToSend.append('newPassword', formData.newPassword);
                }

                formDataToSend.append('profilePicture', profilePictureFile);

                response = await fetch('/api/profile', {
                    method: 'PUT',
                    body: formDataToSend,
                });
            } else {
                // Use JSON for regular updates
                const updatePayload: any = {
                    fullName: formData.fullName,
                    email: formData.email,
                    notificationPreferences: notificationSettings,
                };

                // Include password fields only if changing password
                if (formData.newPassword) {
                    updatePayload.currentPassword = formData.currentPassword;
                    updatePayload.newPassword = formData.newPassword;
                }

                response = await fetch('/api/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatePayload),
                });
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            setSuccess('Profile updated successfully!');
            setProfile(data.data);
            setProfilePictureFile(null);

            // Clear password fields
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            }));

            // Refresh profile data
            await fetchProfile();
        } catch (err: any) {
            console.error('Save error:', err);
            setError(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
                <p className="text-gray-600">Manage your personal information and preferences</p>
            </div>

            {/* Alerts */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-semibold text-red-900 mb-1">Error</h3>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {success && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-semibold text-green-900 mb-1">Success</h3>
                        <p className="text-sm text-green-700">{success}</p>
                    </div>
                </div>
            )}

            {/* Profile Info Card */}
            {profile && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-4">
                        {/* Profile Picture with Upload */}
                        <div className="relative group">
                            <div className="w-20 h-20 rounded-full overflow-hidden bg-teal-100 flex items-center justify-center">
                                {profilePicturePreview ? (
                                    <img
                                        src={profilePicturePreview}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-10 h-10 text-teal-600" />
                                )}
                            </div>
                            {/* Upload Button Overlay */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Camera className="w-6 h-6 text-white" />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpg,image/jpeg,image/webp"
                                onChange={handleProfilePictureChange}
                                className="hidden"
                            />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{profile.fullName}</h2>
                            <p className="text-sm text-gray-600">{profile.email}</p>
                            <div className="flex items-center gap-3 mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profile.role === 'ADMIN'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {profile.role === 'ADMIN' ? 'Admin' : 'Distributor'}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profile.status === 'ACTIVE'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {profile.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Member since:</span>
                            <span className="ml-2 text-gray-900 font-medium">
                                {new Date(profile.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">Last login:</span>
                            <span className="ml-2 text-gray-900 font-medium">
                                {profile.lastLogin
                                    ? new Date(profile.lastLogin).toLocaleDateString()
                                    : 'Never'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                        <p className="text-sm text-gray-600 mt-1">Update your personal details</p>
                    </div>
                    <div className="p-6 space-y-4">
                        {/* Full Name */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-900 mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                    placeholder="your.email@example.com"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                        <p className="text-sm text-gray-600 mt-1">Leave blank to keep current password</p>
                    </div>
                    <div className="p-6 space-y-4">
                        {/* Current Password */}
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                    placeholder="Enter current password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    id="newPassword"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                    placeholder="Enter new password (min 6 characters)"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notification Preferences */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                        <p className="text-sm text-gray-600 mt-1">Choose how you want to receive notifications</p>
                    </div>
                    <div className="p-6 space-y-4">
                        {/* In-App Notifications */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">In-App Notifications</p>
                                    <p className="text-xs text-gray-600">Receive notifications within the app</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleNotificationChange('inApp')}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationSettings.inApp ? 'bg-teal-600' : 'bg-gray-200'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationSettings.inApp ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Email Notifications */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                                    <p className="text-xs text-gray-600">Receive notifications via email</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleNotificationChange('email')}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationSettings.email ? 'bg-teal-600' : 'bg-gray-200'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationSettings.email ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Push Notifications */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                                    <p className="text-xs text-gray-600">Receive push notifications on mobile</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleNotificationChange('push')}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationSettings.push ? 'bg-teal-600' : 'bg-gray-200'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationSettings.push ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

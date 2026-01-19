/**
 * Frontend API client for making authenticated requests
 * Uses httpOnly cookies for web authentication (set by server)
 * Cookies are automatically sent with requests via credentials: 'include'
 */

import { ApiResponse, ApiError, PaginatedResponse } from './types/dto';
import { authStorage } from './auth-storage';

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

// Helper to extract data from standardized response
function unwrapResponse<T>(response: ApiResponse<T>): T {
    return response.data;
}

function unwrapPaginatedResponse<T>(response: PaginatedResponse<T>) {
    return {
        data: response.data,
        pagination: response.pagination,
    };
}

class ApiClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = '/api';
    }

    private async request<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<T> {
        const { params, ...fetchOptions } = options;

        let url = `${this.baseUrl}${endpoint}`;

        // Add query parameters
        if (params) {
            const searchParams = new URLSearchParams(params);
            url += `?${searchParams.toString()}`;
        }

        // Add Bearer token to Authorization header
        const token = authStorage.getToken();
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...fetchOptions.headers,
        };

        const response = await fetch(url, {
            ...fetchOptions,
            headers,
            credentials: 'include', // Enable cookies for authentication
        });

        const data = await response.json();

        if (response.status === 401) {
            if (typeof window !== 'undefined') {
                authStorage.clearAll();
                // Optional: Store current path to redirect back after login
                // sessionStorage.setItem('redirect_url', window.location.pathname);
                window.location.href = '/login';
            }
            // Still throw to stop execution flow in the caller
            throw new Error('Session expired. Please login again.');
        }

        if (!response.ok) {
            // Handle new error format
            const apiError = data as ApiError;
            throw new Error(
                apiError.error?.message || `HTTP ${response.status}`
            );
        }

        return data;
    }

    // Auth
    async login(email: string, password: string) {
        const response = await this.request<any>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        const data = response.success ? response.data : unwrapResponse(response);

        if (data.token) {
            authStorage.setToken(data.token);
        }

        if (data.user) {
            authStorage.setUser(data.user);
        }

        return data;
    }

    async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } catch (error) {
            // Ignore errors during logout
            console.error('Logout error:', error);
        } finally {
            // Clear token from localStorage
            authStorage.clearAll();
        }
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    // Users
    async getUsers(params?: Record<string, string>) {
        const response = await this.request<PaginatedResponse<any>>(
            '/users',
            { params }
        );
        return unwrapPaginatedResponse(response);
    }

    async createUser(data: any) {
        const response = await this.request<ApiResponse<any>>('/users', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return unwrapResponse(response);
    }

    async updateUser(id: string, data: any) {
        const response = await this.request<ApiResponse<any>>(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return unwrapResponse(response);
    }

    async deleteUser(id: string) {
        return this.request(`/users/${id}`, { method: 'DELETE' });
    }

    async toggleUserStatus(id: string) {
        return this.request(`/users/${id}/toggle-status`, { method: 'PATCH' });
    }

    // Distributors
    async getDistributors(params?: Record<string, string>) {
        const response = await this.request<PaginatedResponse<any>>(
            '/distributors',
            { params }
        );
        return unwrapPaginatedResponse(response);
    }

    async createDistributor(data: any) {
        const response = await this.request<ApiResponse<any>>(
            '/distributors',
            {
                method: 'POST',
                body: JSON.stringify(data),
            }
        );
        return unwrapResponse(response);
    }

    async updateDistributor(id: string, data: any) {
        const response = await this.request<ApiResponse<any>>(
            `/distributors/${id}`,
            {
                method: 'PUT',
                body: JSON.stringify(data),
            }
        );
        return unwrapResponse(response);
    }

    async deleteDistributor(id: string) {
        return this.request(`/distributors/${id}`, { method: 'DELETE' });
    }

    // PDFs
    async getPdfs(params?: Record<string, string>) {
        const response = await this.request<PaginatedResponse<any>>('/pdfs', {
            params,
        });
        return unwrapPaginatedResponse(response);
    }

    async uploadPdf(formData: FormData) {
        const token = authStorage.getToken();
        const response = await fetch(`${this.baseUrl}/pdfs/upload`, {
            method: 'POST',
            body: formData, // Don't set Content-Type, browser will set it with boundary
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            credentials: 'include', // Enable cookies for authentication
        });

        const data = await response.json();

        if (!response.ok) {
            const apiError = data as ApiError;
            throw new Error(
                apiError.error?.message || 'Upload failed'
            );
        }

        // Unwrap standardized response
        return unwrapResponse(data);
    }

    getPdfDownloadUrl(id: string) {
        return `${this.baseUrl}/pdfs/${id}/download`;
    }

    // Notifications
    async getNotifications(params?: Record<string, string>) {
        const response = await this.request<PaginatedResponse<any>>(
            '/notifications',
            { params }
        );
        return unwrapPaginatedResponse(response);
    }

    async markNotificationRead(id: string) {
        return this.request(`/notifications/${id}/read`, { method: 'PATCH' });
    }

    // Notification Preferences
    async getNotificationPreferences() {
        const response = await this.request<ApiResponse<any>>(
            '/notifications/preferences'
        );
        return unwrapResponse(response);
    }

    async updateNotificationPreferences(preferences: any) {
        const response = await this.request<ApiResponse<any>>(
            '/notifications/preferences',
            {
                method: 'PUT',
                body: JSON.stringify(preferences),
            }
        );
        return unwrapResponse(response);
    }

    // Device Tokens (for mobile apps)
    async registerDevice(token: string, platform: 'IOS' | 'ANDROID', deviceInfo?: any) {
        const response = await this.request<ApiResponse<any>>('/devices', {
            method: 'POST',
            body: JSON.stringify({ token, platform, deviceInfo }),
        });
        return unwrapResponse(response);
    }

    async getDeviceTokens() {
        const response = await this.request<ApiResponse<any>>('/devices');
        return unwrapResponse(response);
    }

    async removeDeviceToken(token: string) {
        return this.request('/devices', {
            method: 'DELETE',
            params: { token },
        });
    }

    // Logs
    async getLogs(params?: Record<string, string>) {
        const response = await this.request<PaginatedResponse<any>>('/logs', {
            params,
        });
        return unwrapPaginatedResponse(response);
    }

    // News
    async getNews(params?: Record<string, string>) {
        const response = await this.request<PaginatedResponse<any>>('/news', {
            params,
        });
        return unwrapPaginatedResponse(response);
    }

    async createNews(data: any) {
        const response = await this.request<ApiResponse<any>>('/news', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return unwrapResponse(response);
    }

    async updateNews(id: string, data: any) {
        const response = await this.request<ApiResponse<any>>(`/news/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return unwrapResponse(response);
    }

    async deleteNews(id: string) {
        return this.request(`/news/${id}`, { method: 'DELETE' });
    }
}

export const apiClient = new ApiClient();

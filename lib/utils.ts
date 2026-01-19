import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

/**
 * Merge Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'MMM dd, yyyy');
}

/**
 * Format datetime to readable string
 */
export function formatDateTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'MMM dd, yyyy HH:mm');
}

/**
 * Get status badge color class
 */
export function getStatusColor(status: string): string {
    switch (status.toUpperCase()) {
        case 'ACTIVE':
            return 'bg-success-light text-success-dark border-success';
        case 'INACTIVE':
            return 'bg-gray-100 text-gray-600 border-gray-300';
        case 'DONE':
            return 'bg-info-light text-info-dark border-info';
        case 'PENDING':
            return 'bg-warning-light text-warning-dark border-warning';
        default:
            return 'bg-gray-100 text-gray-600 border-gray-300';
    }
}

/**
 * Get role badge color
 */
export function getRoleColor(role: string): string {
    switch (role.toUpperCase()) {
        case 'ADMIN':
            return 'bg-purple-100 text-purple-700 border-purple-300';
        case 'DISTRIBUTOR':
            return 'bg-blue-100 text-blue-700 border-blue-300';
        default:
            return 'bg-gray-100 text-gray-600 border-gray-300';
    }
}

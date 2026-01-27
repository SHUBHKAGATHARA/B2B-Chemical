'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    className = '',
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
            {icon && (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-charcoal-100 to-charcoal-50 flex items-center justify-center mb-6 text-charcoal-400">
                    {icon}
                </div>
            )}
            <h3 className="text-xl font-semibold text-charcoal-800 mb-2">{title}</h3>
            {description && (
                <p className="text-charcoal-500 max-w-sm mb-6">{description}</p>
            )}
            {action}
        </div>
    );
}

interface DataTableEmptyProps {
    title?: string;
    description?: string;
    action?: ReactNode;
}

export function DataTableEmpty({
    title = 'No data found',
    description = 'There are no items to display at the moment.',
    action,
}: DataTableEmptyProps) {
    return (
        <EmptyState
            icon={
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
            }
            title={title}
            description={description}
            action={action}
        />
    );
}

interface SearchEmptyProps {
    searchTerm?: string;
    action?: ReactNode;
}

export function SearchEmpty({ searchTerm, action }: SearchEmptyProps) {
    return (
        <EmptyState
            icon={
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            }
            title="No results found"
            description={
                searchTerm
                    ? `No results found for "${searchTerm}". Try adjusting your search terms.`
                    : 'Try adjusting your filters or search terms.'
            }
            action={action}
        />
    );
}

interface ErrorStateProps {
    title?: string;
    description?: string;
    action?: ReactNode;
}

export function ErrorState({
    title = 'Something went wrong',
    description = 'An error occurred while loading the data. Please try again.',
    action,
}: ErrorStateProps) {
    return (
        <EmptyState
            icon={
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center text-red-500">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
            }
            title={title}
            description={description}
            action={action}
        />
    );
}

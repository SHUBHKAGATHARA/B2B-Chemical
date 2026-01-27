'use client';

import { useState } from 'react';

interface AvatarProps {
    src?: string;
    alt?: string;
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    shape?: 'circle' | 'square';
    status?: 'online' | 'offline' | 'away' | 'busy';
    bordered?: boolean;
    className?: string;
}

export function Avatar({
    src,
    alt = 'Avatar',
    name,
    size = 'md',
    shape = 'circle',
    status,
    bordered = false,
    className = '',
}: AvatarProps) {
    const [imageError, setImageError] = useState(false);

    const sizeStyles = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-xl',
        '2xl': 'w-20 h-20 text-2xl',
    };

    const statusSizes = {
        xs: 'w-1.5 h-1.5',
        sm: 'w-2 h-2',
        md: 'w-2.5 h-2.5',
        lg: 'w-3 h-3',
        xl: 'w-4 h-4',
        '2xl': 'w-5 h-5',
    };

    const statusColors = {
        online: 'bg-emerald-500',
        offline: 'bg-charcoal-400',
        away: 'bg-amber-500',
        busy: 'bg-red-500',
    };

    const shapeStyles = {
        circle: 'rounded-full',
        square: 'rounded-xl',
    };

    const getInitials = (name: string): string => {
        const parts = name.split(' ').filter(Boolean);
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return parts[0]?.slice(0, 2).toUpperCase() || '??';
    };

    const getGradient = (name: string): string => {
        const gradients = [
            'from-primary-400 to-teal-500',
            'from-blue-400 to-indigo-500',
            'from-purple-400 to-pink-500',
            'from-amber-400 to-orange-500',
            'from-emerald-400 to-green-500',
            'from-rose-400 to-red-500',
            'from-cyan-400 to-blue-500',
        ];
        const index = name?.length ? name.charCodeAt(0) % gradients.length : 0;
        return gradients[index];
    };

    const showFallback = !src || imageError;

    return (
        <div className={`relative inline-block ${className}`}>
            <div
                className={`
                    ${sizeStyles[size]}
                    ${shapeStyles[shape]}
                    ${bordered ? 'ring-2 ring-white shadow-lg' : ''}
                    overflow-hidden flex items-center justify-center
                    ${showFallback ? `bg-gradient-to-br ${getGradient(name || '')}` : 'bg-charcoal-100'}
                `}
            >
                {!showFallback ? (
                    <img
                        src={src}
                        alt={alt}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <span className="font-semibold text-white">
                        {name ? getInitials(name) : '?'}
                    </span>
                )}
            </div>
            
            {status && (
                <span
                    className={`
                        absolute bottom-0 right-0
                        ${statusSizes[size]}
                        ${statusColors[status]}
                        ${shapeStyles[shape]}
                        ring-2 ring-white
                    `}
                />
            )}
        </div>
    );
}

interface AvatarGroupProps {
    avatars: Array<{ src?: string; name?: string; alt?: string }>;
    max?: number;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export function AvatarGroup({
    avatars,
    max = 4,
    size = 'md',
    className = '',
}: AvatarGroupProps) {
    const visibleAvatars = avatars.slice(0, max);
    const remainingCount = avatars.length - max;

    const spacingStyles = {
        xs: '-space-x-1.5',
        sm: '-space-x-2',
        md: '-space-x-2.5',
        lg: '-space-x-3',
        xl: '-space-x-4',
    };

    const sizeStyles = {
        xs: 'w-6 h-6 text-[10px]',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
    };

    return (
        <div className={`flex ${spacingStyles[size]} ${className}`}>
            {visibleAvatars.map((avatar, index) => (
                <Avatar
                    key={index}
                    src={avatar.src}
                    name={avatar.name}
                    alt={avatar.alt}
                    size={size}
                    bordered
                />
            ))}
            {remainingCount > 0 && (
                <div
                    className={`
                        ${sizeStyles[size]}
                        rounded-full
                        bg-charcoal-200 text-charcoal-600
                        flex items-center justify-center
                        font-semibold
                        ring-2 ring-white
                    `}
                >
                    +{remainingCount}
                </div>
            )}
        </div>
    );
}

'use client';

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    change?: {
        value: number;
        label?: string;
    };
    icon?: ReactNode;
    variant?: 'default' | 'gradient' | 'bordered' | 'minimal';
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function StatsCard({
    title,
    value,
    change,
    icon,
    variant = 'default',
    color = 'primary',
    size = 'md',
    className = '',
}: StatsCardProps) {
    const colorStyles = {
        primary: {
            gradient: 'from-primary-500 to-teal-500',
            bg: 'bg-primary-50',
            text: 'text-primary-600',
            border: 'border-primary-200',
            iconBg: 'bg-primary-100',
        },
        success: {
            gradient: 'from-emerald-500 to-green-500',
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            border: 'border-emerald-200',
            iconBg: 'bg-emerald-100',
        },
        warning: {
            gradient: 'from-amber-500 to-orange-500',
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            border: 'border-amber-200',
            iconBg: 'bg-amber-100',
        },
        danger: {
            gradient: 'from-red-500 to-rose-500',
            bg: 'bg-red-50',
            text: 'text-red-600',
            border: 'border-red-200',
            iconBg: 'bg-red-100',
        },
        info: {
            gradient: 'from-blue-500 to-indigo-500',
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            border: 'border-blue-200',
            iconBg: 'bg-blue-100',
        },
    };

    const sizeStyles = {
        sm: {
            padding: 'p-4',
            valueSize: 'text-2xl',
            titleSize: 'text-xs',
            iconSize: 'w-8 h-8',
            iconWrapper: 'p-2',
        },
        md: {
            padding: 'p-6',
            valueSize: 'text-3xl',
            titleSize: 'text-sm',
            iconSize: 'w-10 h-10',
            iconWrapper: 'p-3',
        },
        lg: {
            padding: 'p-8',
            valueSize: 'text-4xl',
            titleSize: 'text-base',
            iconSize: 'w-12 h-12',
            iconWrapper: 'p-4',
        },
    };

    const getTrendIcon = () => {
        if (!change) return null;
        if (change.value > 0) return <TrendingUp className="w-4 h-4" />;
        if (change.value < 0) return <TrendingDown className="w-4 h-4" />;
        return <Minus className="w-4 h-4" />;
    };

    const getTrendColor = () => {
        if (!change) return '';
        if (change.value > 0) return 'text-emerald-600 bg-emerald-50';
        if (change.value < 0) return 'text-red-600 bg-red-50';
        return 'text-charcoal-500 bg-charcoal-50';
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'gradient':
                return `bg-gradient-to-br ${colorStyles[color].gradient} text-white`;
            case 'bordered':
                return `bg-white border-2 ${colorStyles[color].border}`;
            case 'minimal':
                return `bg-transparent`;
            default:
                return 'bg-white border border-charcoal-100 shadow-premium';
        }
    };

    const ss = sizeStyles[size];
    const cs = colorStyles[color];

    return (
        <div
            className={`
                relative rounded-2xl overflow-hidden
                transition-all duration-300
                hover:shadow-xl hover:-translate-y-1
                ${getVariantStyles()}
                ${ss.padding}
                ${className}
            `}
        >
            {/* Gradient accent for default variant */}
            {variant === 'default' && (
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${cs.gradient}`} />
            )}

            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className={`
                        font-medium
                        ${ss.titleSize}
                        ${variant === 'gradient' ? 'text-white/80' : 'text-charcoal-500'}
                    `}>
                        {title}
                    </p>
                    <p className={`
                        font-bold
                        ${ss.valueSize}
                        ${variant === 'gradient' ? 'text-white' : 'text-charcoal-900'}
                    `}>
                        {value}
                    </p>
                    {change && (
                        <div className={`
                            inline-flex items-center gap-1.5 px-2 py-1 rounded-full
                            ${ss.titleSize} font-semibold
                            ${variant === 'gradient' ? 'bg-white/20 text-white' : getTrendColor()}
                        `}>
                            {getTrendIcon()}
                            <span>{change.value > 0 ? '+' : ''}{change.value}%</span>
                            {change.label && (
                                <span className={variant === 'gradient' ? 'text-white/70' : 'text-charcoal-400'}>
                                    {change.label}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                {icon && (
                    <div className={`
                        rounded-xl
                        ${ss.iconWrapper}
                        ${variant === 'gradient' ? 'bg-white/20' : cs.iconBg}
                    `}>
                        <div className={`
                            ${ss.iconSize} flex items-center justify-center
                            ${variant === 'gradient' ? 'text-white' : cs.text}
                        `}>
                            {icon}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface QuickActionCardProps {
    title: string;
    description?: string;
    icon: ReactNode;
    onClick?: () => void;
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    className?: string;
}

export function QuickActionCard({
    title,
    description,
    icon,
    onClick,
    color = 'primary',
    className = '',
}: QuickActionCardProps) {
    const colorStyles = {
        primary: 'from-primary-500 to-teal-500 group-hover:from-primary-600 group-hover:to-teal-600',
        success: 'from-emerald-500 to-green-500 group-hover:from-emerald-600 group-hover:to-green-600',
        warning: 'from-amber-500 to-orange-500 group-hover:from-amber-600 group-hover:to-orange-600',
        danger: 'from-red-500 to-rose-500 group-hover:from-red-600 group-hover:to-rose-600',
        info: 'from-blue-500 to-indigo-500 group-hover:from-blue-600 group-hover:to-indigo-600',
    };

    return (
        <button
            onClick={onClick}
            className={`
                group relative w-full p-6
                bg-white rounded-2xl
                border border-charcoal-100
                shadow-sm hover:shadow-xl
                transition-all duration-300
                hover:-translate-y-1
                text-left
                ${className}
            `}
        >
            <div className={`
                absolute inset-0 rounded-2xl
                bg-gradient-to-br ${colorStyles[color]}
                opacity-0 group-hover:opacity-5
                transition-opacity duration-300
            `} />
            
            <div className="relative z-10">
                <div className={`
                    inline-flex p-3 rounded-xl mb-4
                    bg-gradient-to-br ${colorStyles[color]}
                    text-white shadow-lg
                    transform group-hover:scale-110
                    transition-transform duration-300
                `}>
                    {icon}
                </div>
                <h3 className="font-semibold text-charcoal-800 mb-1">{title}</h3>
                {description && (
                    <p className="text-sm text-charcoal-500">{description}</p>
                )}
            </div>
            
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-charcoal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </div>
        </button>
    );
}

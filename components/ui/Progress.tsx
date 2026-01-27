'use client';

import { useEffect, useState } from 'react';

interface ProgressProps {
    value: number;
    max?: number;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    variant?: 'default' | 'gradient' | 'striped' | 'glow';
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    showValue?: boolean;
    animated?: boolean;
    label?: string;
    className?: string;
}

export function Progress({
    value,
    max = 100,
    size = 'md',
    variant = 'default',
    color = 'primary',
    showValue = false,
    animated = true,
    label,
    className = '',
}: ProgressProps) {
    const [displayValue, setDisplayValue] = useState(0);
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    useEffect(() => {
        if (animated) {
            const timer = setTimeout(() => {
                setDisplayValue(percentage);
            }, 100);
            return () => clearTimeout(timer);
        } else {
            setDisplayValue(percentage);
        }
    }, [percentage, animated]);

    const sizeStyles = {
        xs: 'h-1',
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4',
    };

    const colorStyles = {
        primary: 'from-primary-400 to-primary-600',
        success: 'from-emerald-400 to-emerald-600',
        warning: 'from-amber-400 to-amber-600',
        danger: 'from-red-400 to-red-600',
        info: 'from-blue-400 to-blue-600',
    };

    const solidColorStyles = {
        primary: 'bg-primary-500',
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        danger: 'bg-red-500',
        info: 'bg-blue-500',
    };

    const glowColorStyles = {
        primary: 'shadow-primary-500/50',
        success: 'shadow-emerald-500/50',
        warning: 'shadow-amber-500/50',
        danger: 'shadow-red-500/50',
        info: 'shadow-blue-500/50',
    };

    const getBarStyles = () => {
        switch (variant) {
            case 'gradient':
                return `bg-gradient-to-r ${colorStyles[color]}`;
            case 'striped':
                return `${solidColorStyles[color]} bg-stripes`;
            case 'glow':
                return `bg-gradient-to-r ${colorStyles[color]} shadow-lg ${glowColorStyles[color]}`;
            default:
                return solidColorStyles[color];
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {(label || showValue) && (
                <div className="flex justify-between items-center text-sm">
                    {label && <span className="font-medium text-charcoal-700">{label}</span>}
                    {showValue && (
                        <span className="font-semibold text-charcoal-900">
                            {Math.round(displayValue)}%
                        </span>
                    )}
                </div>
            )}
            <div className={`w-full bg-charcoal-100 rounded-full overflow-hidden ${sizeStyles[size]}`}>
                <div
                    className={`
                        h-full rounded-full
                        transition-all duration-700 ease-out
                        ${getBarStyles()}
                        ${variant === 'striped' && animated ? 'animate-stripes' : ''}
                    `}
                    style={{ width: `${displayValue}%` }}
                />
            </div>
        </div>
    );
}

interface CircularProgressProps {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    showValue?: boolean;
    animated?: boolean;
    label?: string;
    className?: string;
}

export function CircularProgress({
    value,
    max = 100,
    size = 120,
    strokeWidth = 8,
    color = 'primary',
    showValue = true,
    animated = true,
    label,
    className = '',
}: CircularProgressProps) {
    const [displayValue, setDisplayValue] = useState(0);
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    useEffect(() => {
        if (animated) {
            const timer = setTimeout(() => {
                setDisplayValue(percentage);
            }, 100);
            return () => clearTimeout(timer);
        } else {
            setDisplayValue(percentage);
        }
    }, [percentage, animated]);

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (displayValue / 100) * circumference;

    const colorStyles = {
        primary: 'stroke-primary-500',
        success: 'stroke-emerald-500',
        warning: 'stroke-amber-500',
        danger: 'stroke-red-500',
        info: 'stroke-blue-500',
    };

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-charcoal-100"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className={`${colorStyles[color]} transition-all duration-700 ease-out`}
                />
            </svg>
            {showValue && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-charcoal-900">
                        {Math.round(displayValue)}%
                    </span>
                    {label && (
                        <span className="text-xs text-charcoal-500 mt-1">{label}</span>
                    )}
                </div>
            )}
        </div>
    );
}

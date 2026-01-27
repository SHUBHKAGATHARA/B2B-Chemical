'use client';

import { useEffect, useRef, useState } from 'react';

interface CounterProps {
    end: number;
    start?: number;
    duration?: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    className?: string;
    separator?: string;
    onComplete?: () => void;
}

export function Counter({
    end,
    start = 0,
    duration = 2000,
    decimals = 0,
    prefix = '',
    suffix = '',
    className = '',
    separator = ',',
    onComplete,
}: CounterProps) {
    const [count, setCount] = useState(start);
    const countRef = useRef(start);
    const startTimeRef = useRef<number | null>(null);
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

        const animate = (timestamp: number) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp;
            }

            const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
            const easedProgress = easeOutQuart(progress);
            const currentCount = start + (end - start) * easedProgress;

            countRef.current = currentCount;
            setCount(currentCount);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                onComplete?.();
            }
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [end, start, duration, onComplete]);

    const formatNumber = (num: number): string => {
        const fixed = num.toFixed(decimals);
        const [intPart, decPart] = fixed.split('.');
        const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
        return decPart ? `${formattedInt}.${decPart}` : formattedInt;
    };

    return (
        <span className={className}>
            {prefix}{formatNumber(count)}{suffix}
        </span>
    );
}

interface AnimatedCounterProps {
    value: number;
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    prefix?: string;
    suffix?: string;
}

export function AnimatedCounter({
    value,
    title,
    subtitle,
    icon,
    color = 'primary',
    prefix = '',
    suffix = '',
}: AnimatedCounterProps) {
    const colorStyles = {
        primary: 'from-primary-500 to-teal-500',
        success: 'from-emerald-500 to-green-500',
        warning: 'from-amber-500 to-orange-500',
        danger: 'from-red-500 to-rose-500',
        info: 'from-blue-500 to-indigo-500',
    };

    const iconBgStyles = {
        primary: 'bg-primary-100 text-primary-600',
        success: 'bg-emerald-100 text-emerald-600',
        warning: 'bg-amber-100 text-amber-600',
        danger: 'bg-red-100 text-red-600',
        info: 'bg-blue-100 text-blue-600',
    };

    return (
        <div className="relative p-6 bg-white rounded-2xl border border-charcoal-100 shadow-premium group hover:shadow-xl transition-all duration-300 overflow-hidden">
            {/* Gradient Accent */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorStyles[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-charcoal-500 mb-2">{title}</p>
                    <Counter
                        end={value}
                        prefix={prefix}
                        suffix={suffix}
                        className={`text-4xl font-bold bg-gradient-to-r ${colorStyles[color]} bg-clip-text text-transparent`}
                    />
                    {subtitle && (
                        <p className="text-xs text-charcoal-400 mt-2">{subtitle}</p>
                    )}
                </div>
                {icon && (
                    <div className={`p-3 rounded-xl ${iconBgStyles[color]} transform group-hover:scale-110 transition-transform duration-300`}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import { useEffect, useRef } from 'react';

interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    strokeWidth?: number;
    color?: string;
    fillColor?: string;
    showArea?: boolean;
    showDots?: boolean;
    animated?: boolean;
    className?: string;
}

export function Sparkline({
    data,
    width = 100,
    height = 32,
    strokeWidth = 2,
    color = '#10b981',
    fillColor,
    showArea = true,
    showDots = false,
    animated = true,
    className = '',
}: SparklineProps) {
    const pathRef = useRef<SVGPathElement>(null);
    const areaRef = useRef<SVGPathElement>(null);

    const padding = 4;
    const effectiveWidth = width - padding * 2;
    const effectiveHeight = height - padding * 2;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => ({
        x: padding + (index / (data.length - 1)) * effectiveWidth,
        y: padding + effectiveHeight - ((value - min) / range) * effectiveHeight,
    }));

    const linePath = points
        .map((point, i) => (i === 0 ? `M ${point.x},${point.y}` : `L ${point.x},${point.y}`))
        .join(' ');

    const areaPath = `${linePath} L ${points[points.length - 1].x},${height - padding} L ${padding},${height - padding} Z`;

    useEffect(() => {
        if (animated && pathRef.current) {
            const length = pathRef.current.getTotalLength();
            pathRef.current.style.strokeDasharray = `${length}`;
            pathRef.current.style.strokeDashoffset = `${length}`;
            pathRef.current.animate(
                [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
                { duration: 1000, easing: 'ease-out', fill: 'forwards' }
            );
        }
        if (animated && areaRef.current && showArea) {
            areaRef.current.animate(
                [{ opacity: 0 }, { opacity: 1 }],
                { duration: 1000, delay: 500, easing: 'ease-out', fill: 'forwards' }
            );
        }
    }, [animated, showArea, data]);

    return (
        <svg width={width} height={height} className={className}>
            {showArea && (
                <path
                    ref={areaRef}
                    d={areaPath}
                    fill={fillColor || `${color}20`}
                    style={{ opacity: animated ? 0 : 1 }}
                />
            )}
            <path
                ref={pathRef}
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {showDots &&
                points.map((point, i) => (
                    <circle
                        key={i}
                        cx={point.x}
                        cy={point.y}
                        r={3}
                        fill="white"
                        stroke={color}
                        strokeWidth={2}
                    />
                ))}
        </svg>
    );
}

interface MiniChartProps {
    data: number[];
    label?: string;
    value?: string | number;
    change?: {
        value: number;
        label?: string;
    };
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    className?: string;
}

export function MiniChart({
    data,
    label,
    value,
    change,
    color = 'primary',
    className = '',
}: MiniChartProps) {
    const colorMap = {
        primary: '#10b981',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
    };

    const isPositive = change ? change.value >= 0 : true;

    return (
        <div className={`bg-white rounded-xl border border-charcoal-100 p-4 shadow-sm ${className}`}>
            <div className="flex items-center justify-between mb-3">
                <div>
                    {label && (
                        <p className="text-xs text-charcoal-500 font-medium">{label}</p>
                    )}
                    {value && (
                        <p className="text-xl font-bold text-charcoal-900 mt-1">{value}</p>
                    )}
                </div>
                {change && (
                    <div
                        className={`
                            px-2 py-1 rounded-full text-xs font-semibold
                            ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}
                        `}
                    >
                        {isPositive ? '+' : ''}{change.value}%
                    </div>
                )}
            </div>
            <Sparkline
                data={data}
                width={160}
                height={40}
                color={colorMap[color]}
                showArea
            />
        </div>
    );
}

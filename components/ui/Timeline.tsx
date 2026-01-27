'use client';

import { ReactNode } from 'react';
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';

interface TimelineItem {
    id: string;
    title: string;
    description?: string;
    date?: string;
    status?: 'completed' | 'current' | 'pending' | 'error';
    icon?: ReactNode;
}

interface TimelineProps {
    items: TimelineItem[];
    variant?: 'default' | 'compact' | 'alternating';
    className?: string;
}

export function Timeline({
    items,
    variant = 'default',
    className = '',
}: TimelineProps) {
    const getStatusIcon = (status: TimelineItem['status']) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5" />;
            case 'current':
                return <Clock className="w-5 h-5 animate-pulse" />;
            case 'error':
                return <AlertCircle className="w-5 h-5" />;
            default:
                return <Circle className="w-5 h-5" />;
        }
    };

    const getStatusStyles = (status: TimelineItem['status']) => {
        switch (status) {
            case 'completed':
                return 'bg-emerald-100 text-emerald-600 border-emerald-200';
            case 'current':
                return 'bg-primary-100 text-primary-600 border-primary-200 ring-4 ring-primary-50';
            case 'error':
                return 'bg-red-100 text-red-600 border-red-200';
            default:
                return 'bg-charcoal-100 text-charcoal-400 border-charcoal-200';
        }
    };

    const getLineStyles = (status: TimelineItem['status']) => {
        switch (status) {
            case 'completed':
                return 'bg-emerald-300';
            case 'current':
                return 'bg-gradient-to-b from-emerald-300 to-charcoal-200';
            default:
                return 'bg-charcoal-200';
        }
    };

    if (variant === 'compact') {
        return (
            <div className={`space-y-0 ${className}`}>
                {items.map((item, index) => (
                    <div key={item.id} className="flex items-start gap-3 pb-6 last:pb-0">
                        <div className="flex flex-col items-center">
                            <div
                                className={`
                                    w-8 h-8 rounded-full border-2
                                    flex items-center justify-center
                                    ${getStatusStyles(item.status)}
                                `}
                            >
                                {item.icon || getStatusIcon(item.status)}
                            </div>
                            {index < items.length - 1 && (
                                <div className={`w-0.5 flex-1 min-h-[2rem] ${getLineStyles(item.status)}`} />
                            )}
                        </div>
                        <div className="flex-1 pt-1">
                            <h4 className="font-semibold text-charcoal-800">{item.title}</h4>
                            {item.description && (
                                <p className="text-sm text-charcoal-500 mt-1">{item.description}</p>
                            )}
                            {item.date && (
                                <p className="text-xs text-charcoal-400 mt-1">{item.date}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (variant === 'alternating') {
        return (
            <div className={`relative ${className}`}>
                {/* Center line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-charcoal-200 -translate-x-1/2" />
                
                {items.map((item, index) => {
                    const isLeft = index % 2 === 0;
                    return (
                        <div
                            key={item.id}
                            className={`
                                flex items-center mb-8 last:mb-0
                                ${isLeft ? 'flex-row' : 'flex-row-reverse'}
                            `}
                        >
                            <div className={`w-5/12 ${isLeft ? 'text-right pr-8' : 'text-left pl-8'}`}>
                                <div className="bg-white p-4 rounded-xl border border-charcoal-200 shadow-premium hover:shadow-xl transition-shadow duration-300">
                                    <h4 className="font-semibold text-charcoal-800">{item.title}</h4>
                                    {item.description && (
                                        <p className="text-sm text-charcoal-500 mt-1">{item.description}</p>
                                    )}
                                    {item.date && (
                                        <p className="text-xs text-charcoal-400 mt-2">{item.date}</p>
                                    )}
                                </div>
                            </div>
                            <div className="w-2/12 flex justify-center">
                                <div
                                    className={`
                                        w-10 h-10 rounded-full border-2
                                        flex items-center justify-center
                                        ${getStatusStyles(item.status)}
                                        z-10 bg-white
                                    `}
                                >
                                    {item.icon || getStatusIcon(item.status)}
                                </div>
                            </div>
                            <div className="w-5/12" />
                        </div>
                    );
                })}
            </div>
        );
    }

    // Default variant
    return (
        <div className={`space-y-0 ${className}`}>
            {items.map((item, index) => (
                <div key={item.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <div
                            className={`
                                w-10 h-10 rounded-full border-2
                                flex items-center justify-center
                                ${getStatusStyles(item.status)}
                            `}
                        >
                            {item.icon || getStatusIcon(item.status)}
                        </div>
                        {index < items.length - 1 && (
                            <div className={`w-0.5 flex-1 min-h-[3rem] ${getLineStyles(item.status)}`} />
                        )}
                    </div>
                    <div className="flex-1 pb-8 last:pb-0">
                        <div className="bg-white p-4 rounded-xl border border-charcoal-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <h4 className="font-semibold text-charcoal-800">{item.title}</h4>
                            {item.description && (
                                <p className="text-sm text-charcoal-500 mt-2">{item.description}</p>
                            )}
                            {item.date && (
                                <p className="text-xs text-charcoal-400 mt-2">{item.date}</p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

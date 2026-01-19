import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
    return (
        <div 
            className={`card ${hover ? 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

export function CardPremium({ children, className = '', hover = false, onClick }: CardProps) {
    return (
        <div 
            className={`card-premium ${hover ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

export function CardGlass({ children, className = '' }: CardProps) {
    return (
        <div className={`card-glass ${className}`}>
            {children}
        </div>
    );
}

interface StatCardProps {
    icon: ReactNode;
    value: string | number;
    label: string;
    change?: {
        value: string;
        trend: 'up' | 'down' | 'neutral';
    };
    iconBg: string;
}

export function StatCard({ icon, value, label, change, iconBg }: StatCardProps) {
    const trendColors = {
        up: 'text-emerald-600',
        down: 'text-red-600',
        neutral: 'text-charcoal-600',
    };

    const trendIcons = {
        up: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
        ),
        down: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
            </svg>
        ),
        neutral: null,
    };

    return (
        <div className="stat-card">
            <div className={`stat-icon ${iconBg}`}>
                {icon}
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            {change && (
                <div className={`stat-change ${trendColors[change.trend]}`}>
                    {trendIcons[change.trend]}
                    <span>{change.value}</span>
                </div>
            )}
        </div>
    );
}

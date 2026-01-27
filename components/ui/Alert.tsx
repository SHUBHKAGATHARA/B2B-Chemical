'use client';

import { useState, ReactNode } from 'react';
import { Check, Copy, X } from 'lucide-react';

interface AlertProps {
    variant?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    children: ReactNode;
    dismissible?: boolean;
    onDismiss?: () => void;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
}

export function Alert({
    variant = 'info',
    title,
    children,
    dismissible = false,
    onDismiss,
    icon,
    action,
    className = '',
}: AlertProps) {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    const variantStyles = {
        info: {
            wrapper: 'bg-blue-50 border-blue-200 text-blue-800',
            icon: 'text-blue-500',
            title: 'text-blue-800',
        },
        success: {
            wrapper: 'bg-emerald-50 border-emerald-200 text-emerald-800',
            icon: 'text-emerald-500',
            title: 'text-emerald-800',
        },
        warning: {
            wrapper: 'bg-amber-50 border-amber-200 text-amber-800',
            icon: 'text-amber-500',
            title: 'text-amber-800',
        },
        error: {
            wrapper: 'bg-red-50 border-red-200 text-red-800',
            icon: 'text-red-500',
            title: 'text-red-800',
        },
    };

    const defaultIcons = {
        info: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
        ),
        success: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
        ),
        warning: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
        ),
        error: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
        ),
    };

    const styles = variantStyles[variant];

    const handleDismiss = () => {
        setIsVisible(false);
        onDismiss?.();
    };

    return (
        <div
            className={`
                relative flex gap-3 p-4
                border rounded-xl
                ${styles.wrapper}
                ${className}
            `}
            role="alert"
        >
            <div className={`flex-shrink-0 ${styles.icon}`}>
                {icon || defaultIcons[variant]}
            </div>
            <div className="flex-1 min-w-0">
                {title && (
                    <h4 className={`font-semibold mb-1 ${styles.title}`}>{title}</h4>
                )}
                <div className="text-sm">{children}</div>
                {action && <div className="mt-3">{action}</div>}
            </div>
            {dismissible && (
                <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}

interface CodeBlockProps {
    code: string;
    language?: string;
    showLineNumbers?: boolean;
    copyable?: boolean;
    className?: string;
}

export function CodeBlock({
    code,
    language = 'text',
    showLineNumbers = true,
    copyable = true,
    className = '',
}: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const lines = code.split('\n');

    return (
        <div className={`relative group rounded-xl overflow-hidden ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-charcoal-800 border-b border-charcoal-700">
                <span className="text-xs font-medium text-charcoal-400 uppercase tracking-wider">
                    {language}
                </span>
                {copyable && (
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 text-xs text-charcoal-400 hover:text-white transition-colors"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                <span>Copy</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Code */}
            <div className="bg-charcoal-900 p-4 overflow-x-auto">
                <pre className="text-sm font-mono">
                    <code>
                        {lines.map((line, index) => (
                            <div key={index} className="flex">
                                {showLineNumbers && (
                                    <span className="select-none text-charcoal-600 w-8 text-right pr-4 flex-shrink-0">
                                        {index + 1}
                                    </span>
                                )}
                                <span className="text-charcoal-100">{line || ' '}</span>
                            </div>
                        ))}
                    </code>
                </pre>
            </div>
        </div>
    );
}

interface CalloutProps {
    emoji?: string;
    title?: string;
    children: ReactNode;
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
    className?: string;
}

export function Callout({
    emoji,
    title,
    children,
    variant = 'default',
    className = '',
}: CalloutProps) {
    const variantStyles = {
        default: 'bg-charcoal-50 border-charcoal-200',
        primary: 'bg-primary-50 border-primary-200',
        success: 'bg-emerald-50 border-emerald-200',
        warning: 'bg-amber-50 border-amber-200',
        danger: 'bg-red-50 border-red-200',
    };

    return (
        <div
            className={`
                flex gap-4 p-4
                border-l-4 rounded-r-xl
                ${variantStyles[variant]}
                ${className}
            `}
        >
            {emoji && <span className="text-2xl flex-shrink-0">{emoji}</span>}
            <div>
                {title && (
                    <h4 className="font-semibold text-charcoal-800 mb-1">{title}</h4>
                )}
                <div className="text-sm text-charcoal-600">{children}</div>
            </div>
        </div>
    );
}

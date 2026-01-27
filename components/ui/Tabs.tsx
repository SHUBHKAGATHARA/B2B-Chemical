'use client';

import { ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface TabItem {
    id: string;
    label: string;
    icon?: ReactNode;
    badge?: number | string;
    disabled?: boolean;
}

interface TabsProps {
    items: TabItem[];
    activeTab: string;
    onChange: (id: string) => void;
    variant?: 'default' | 'pills' | 'underline' | 'enclosed';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    className?: string;
}

export function Tabs({
    items,
    activeTab,
    onChange,
    variant = 'default',
    size = 'md',
    fullWidth = false,
    className = '',
}: TabsProps) {
    const sizeStyles = {
        sm: 'text-sm gap-1.5 px-3 py-1.5',
        md: 'text-sm gap-2 px-4 py-2',
        lg: 'text-base gap-2.5 px-5 py-2.5',
    };

    const getVariantStyles = (isActive: boolean, disabled: boolean) => {
        if (disabled) {
            return 'opacity-50 cursor-not-allowed';
        }

        switch (variant) {
            case 'pills':
                return isActive
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30'
                    : 'text-charcoal-600 hover:bg-charcoal-100 hover:text-charcoal-900';
            case 'underline':
                return isActive
                    ? 'text-primary-600 border-b-2 border-primary-500'
                    : 'text-charcoal-500 border-b-2 border-transparent hover:text-charcoal-700 hover:border-charcoal-300';
            case 'enclosed':
                return isActive
                    ? 'bg-white text-primary-600 border border-charcoal-200 border-b-white -mb-px rounded-t-lg'
                    : 'text-charcoal-500 hover:text-charcoal-700 border border-transparent';
            default:
                return isActive
                    ? 'bg-primary-50 text-primary-600 border border-primary-200'
                    : 'text-charcoal-600 hover:bg-charcoal-50 border border-transparent';
        }
    };

    const containerStyles = {
        default: 'bg-charcoal-50 p-1 rounded-xl gap-1',
        pills: 'gap-2',
        underline: 'border-b border-charcoal-200 gap-0',
        enclosed: 'border-b border-charcoal-200 gap-0',
    };

    const itemBaseStyles = {
        default: 'rounded-lg',
        pills: 'rounded-full',
        underline: 'rounded-none',
        enclosed: 'rounded-none',
    };

    return (
        <div
            className={`
                flex ${fullWidth ? 'w-full' : 'inline-flex'}
                ${containerStyles[variant]}
                ${className}
            `}
        >
            {items.map((item) => {
                const isActive = item.id === activeTab;
                return (
                    <button
                        key={item.id}
                        onClick={() => !item.disabled && onChange(item.id)}
                        className={`
                            ${fullWidth ? 'flex-1' : ''}
                            flex items-center justify-center
                            ${sizeStyles[size]}
                            ${itemBaseStyles[variant]}
                            font-medium
                            transition-all duration-200
                            ${getVariantStyles(isActive, !!item.disabled)}
                        `}
                        disabled={item.disabled}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                        {item.badge !== undefined && (
                            <span
                                className={`
                                    px-1.5 py-0.5 text-xs font-semibold rounded-full
                                    ${isActive 
                                        ? variant === 'pills' 
                                            ? 'bg-white/20 text-white' 
                                            : 'bg-primary-100 text-primary-700'
                                        : 'bg-charcoal-200 text-charcoal-600'
                                    }
                                `}
                            >
                                {item.badge}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

interface AccordionItem {
    id: string;
    title: string;
    content: ReactNode;
    icon?: ReactNode;
    disabled?: boolean;
}

interface AccordionProps {
    items: AccordionItem[];
    defaultOpen?: string[];
    allowMultiple?: boolean;
    variant?: 'default' | 'bordered' | 'separated';
    className?: string;
}

export function Accordion({
    items,
    defaultOpen = [],
    allowMultiple = false,
    variant = 'default',
    className = '',
}: AccordionProps) {
    const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

    const toggleItem = (id: string) => {
        if (allowMultiple) {
            setOpenItems((prev) =>
                prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
            );
        } else {
            setOpenItems((prev) => (prev.includes(id) ? [] : [id]));
        }
    };

    const variantStyles = {
        default: 'divide-y divide-charcoal-100',
        bordered: 'border border-charcoal-200 rounded-xl divide-y divide-charcoal-200',
        separated: 'space-y-3',
    };

    const itemStyles = {
        default: '',
        bordered: '',
        separated: 'border border-charcoal-200 rounded-xl overflow-hidden',
    };

    return (
        <div className={`${variantStyles[variant]} ${className}`}>
            {items.map((item) => {
                const isOpen = openItems.includes(item.id);
                return (
                    <div key={item.id} className={itemStyles[variant]}>
                        <button
                            onClick={() => !item.disabled && toggleItem(item.id)}
                            className={`
                                w-full flex items-center justify-between
                                px-4 py-4
                                text-left font-medium text-charcoal-800
                                hover:bg-charcoal-50
                                transition-colors duration-200
                                ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                            disabled={item.disabled}
                        >
                            <div className="flex items-center gap-3">
                                {item.icon}
                                <span>{item.title}</span>
                            </div>
                            <ChevronDown
                                className={`
                                    w-5 h-5 text-charcoal-400
                                    transition-transform duration-300
                                    ${isOpen ? 'rotate-180' : ''}
                                `}
                            />
                        </button>
                        <div
                            className={`
                                overflow-hidden transition-all duration-300 ease-out
                                ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                            `}
                        >
                            <div className="px-4 pb-4 text-charcoal-600">
                                {item.content}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

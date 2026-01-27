'use client';

import { ReactNode } from 'react';

interface DropdownItem {
    id: string;
    label: string;
    icon?: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    divider?: boolean;
    danger?: boolean;
}

interface DropdownProps {
    trigger: ReactNode;
    items: DropdownItem[];
    position?: 'left' | 'right';
    className?: string;
}

import { useState, useRef, useEffect } from 'react';

export function Dropdown({
    trigger,
    items,
    position = 'left',
    className = '',
}: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const positionStyles = {
        left: 'left-0',
        right: 'right-0',
    };

    return (
        <div ref={dropdownRef} className={`relative inline-block ${className}`}>
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                {trigger}
            </div>
            
            {isOpen && (
                <div
                    className={`
                        absolute z-50 mt-2 min-w-[200px]
                        bg-white rounded-xl shadow-xl
                        border border-charcoal-100
                        py-1 animate-scaleIn origin-top
                        ${positionStyles[position]}
                    `}
                >
                    {items.map((item, index) => {
                        if (item.divider) {
                            return (
                                <div
                                    key={`divider-${index}`}
                                    className="my-1 border-t border-charcoal-100"
                                />
                            );
                        }

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (!item.disabled) {
                                        item.onClick?.();
                                        setIsOpen(false);
                                    }
                                }}
                                disabled={item.disabled}
                                className={`
                                    w-full px-4 py-2.5 text-left
                                    flex items-center gap-3
                                    text-sm font-medium
                                    transition-colors duration-150
                                    ${item.disabled
                                        ? 'text-charcoal-300 cursor-not-allowed'
                                        : item.danger
                                            ? 'text-red-600 hover:bg-red-50'
                                            : 'text-charcoal-700 hover:bg-charcoal-50 hover:text-charcoal-900'
                                    }
                                `}
                            >
                                {item.icon && (
                                    <span className={item.disabled ? 'opacity-50' : ''}>
                                        {item.icon}
                                    </span>
                                )}
                                {item.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

interface SelectOption {
    value: string;
    label: string;
    icon?: ReactNode;
    disabled?: boolean;
}

interface SelectProps {
    options: SelectOption[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    label?: string;
    className?: string;
}

export function Select({
    options,
    value,
    onChange,
    placeholder = 'Select an option',
    disabled = false,
    error,
    label,
    className = '',
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-charcoal-700">
                    {label}
                </label>
            )}
            
            <div ref={selectRef} className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`
                        w-full px-4 py-3 text-left
                        bg-white border-2 rounded-xl
                        flex items-center justify-between
                        transition-all duration-200
                        ${disabled
                            ? 'bg-charcoal-50 cursor-not-allowed opacity-60'
                            : 'hover:border-charcoal-300 cursor-pointer'
                        }
                        ${error
                            ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20'
                            : isOpen
                                ? 'border-primary-500 ring-2 ring-primary-500/20'
                                : 'border-charcoal-200'
                        }
                    `}
                >
                    <span className={`flex items-center gap-2 ${!selectedOption ? 'text-charcoal-400' : 'text-charcoal-800'}`}>
                        {selectedOption?.icon}
                        {selectedOption?.label || placeholder}
                    </span>
                    <svg
                        className={`w-5 h-5 text-charcoal-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-charcoal-100 py-1 animate-scaleIn origin-top max-h-60 overflow-y-auto scrollbar-premium">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    if (!option.disabled) {
                                        onChange?.(option.value);
                                        setIsOpen(false);
                                    }
                                }}
                                disabled={option.disabled}
                                className={`
                                    w-full px-4 py-2.5 text-left
                                    flex items-center gap-2
                                    text-sm font-medium
                                    transition-colors duration-150
                                    ${option.disabled
                                        ? 'text-charcoal-300 cursor-not-allowed'
                                        : option.value === value
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-charcoal-700 hover:bg-charcoal-50'
                                    }
                                `}
                            >
                                {option.icon}
                                {option.label}
                                {option.value === value && (
                                    <svg className="w-4 h-4 ml-auto text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {error && (
                <p className="text-xs text-danger flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

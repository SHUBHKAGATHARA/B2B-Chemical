'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
    children: ReactNode;
    content: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    className?: string;
}

export function Tooltip({
    children,
    content,
    position = 'top',
    delay = 200,
    className = '',
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();

    const showTooltip = () => {
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    useEffect(() => {
        if (isVisible && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current?.getBoundingClientRect();
            
            let top = 0;
            let left = 0;
            const gap = 8;

            switch (position) {
                case 'top':
                    top = rect.top - (tooltipRect?.height || 0) - gap;
                    left = rect.left + rect.width / 2;
                    break;
                case 'bottom':
                    top = rect.bottom + gap;
                    left = rect.left + rect.width / 2;
                    break;
                case 'left':
                    top = rect.top + rect.height / 2;
                    left = rect.left - (tooltipRect?.width || 0) - gap;
                    break;
                case 'right':
                    top = rect.top + rect.height / 2;
                    left = rect.right + gap;
                    break;
            }

            setCoords({ top, left });
        }
    }, [isVisible, position]);

    const positionClasses = {
        top: '-translate-x-1/2 -translate-y-full',
        bottom: '-translate-x-1/2',
        left: '-translate-y-1/2 -translate-x-full',
        right: '-translate-y-1/2',
    };

    const arrowClasses = {
        top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-t-charcoal-800 border-x-transparent border-b-transparent',
        bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-b-charcoal-800 border-x-transparent border-t-transparent',
        left: 'right-0 top-1/2 -translate-y-1/2 translate-x-full border-l-charcoal-800 border-y-transparent border-r-transparent',
        right: 'left-0 top-1/2 -translate-y-1/2 -translate-x-full border-r-charcoal-800 border-y-transparent border-l-transparent',
    };

    return (
        <>
            <div
                ref={triggerRef}
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                onFocus={showTooltip}
                onBlur={hideTooltip}
                className="inline-block"
            >
                {children}
            </div>
            {isVisible && typeof window !== 'undefined' && createPortal(
                <div
                    ref={tooltipRef}
                    className={`
                        fixed z-50 pointer-events-none
                        ${positionClasses[position]}
                    `}
                    style={{ top: coords.top, left: coords.left }}
                >
                    <div
                        className={`
                            relative px-3 py-2
                            bg-charcoal-800 text-white
                            text-sm font-medium
                            rounded-lg shadow-xl
                            animate-fadeIn
                            ${className}
                        `}
                    >
                        {content}
                        <div
                            className={`
                                absolute w-0 h-0
                                border-[6px]
                                ${arrowClasses[position]}
                            `}
                        />
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

interface PopoverProps {
    trigger: ReactNode;
    content: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    triggerType?: 'click' | 'hover';
    className?: string;
    contentClassName?: string;
}

export function Popover({
    trigger,
    content,
    position = 'bottom',
    triggerType = 'click',
    className = '',
    contentClassName = '',
}: PopoverProps) {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen && triggerType === 'click') {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, triggerType]);

    const positionStyles = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const handleToggle = () => {
        if (triggerType === 'click') {
            setIsOpen(!isOpen);
        }
    };

    const handleMouseEnter = () => {
        if (triggerType === 'hover') {
            setIsOpen(true);
        }
    };

    const handleMouseLeave = () => {
        if (triggerType === 'hover') {
            setIsOpen(false);
        }
    };

    return (
        <div
            ref={popoverRef}
            className={`relative inline-block ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div onClick={handleToggle} className="cursor-pointer">
                {trigger}
            </div>
            {isOpen && (
                <div
                    className={`
                        absolute z-50
                        ${positionStyles[position]}
                        ${contentClassName}
                    `}
                >
                    <div className="bg-white rounded-xl shadow-xl border border-charcoal-100 p-4 animate-fadeIn">
                        {content}
                    </div>
                </div>
            )}
        </div>
    );
}

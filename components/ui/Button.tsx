'use client';

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'gradient';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    loading?: boolean;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    rounded?: 'sm' | 'md' | 'lg' | 'full';
    glow?: boolean;
    pulse?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            variant = 'primary',
            size = 'md',
            loading = false,
            icon,
            iconPosition = 'left',
            fullWidth = false,
            rounded = 'lg',
            glow = false,
            pulse = false,
            className = '',
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles = `
            relative inline-flex items-center justify-center gap-2 font-semibold
            transition-all duration-300 ease-out
            focus:outline-none focus:ring-2 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            transform hover:scale-[1.02] active:scale-[0.98]
        `;

        const variantStyles = {
            primary: `
                bg-gradient-to-r from-primary-500 to-primary-600
                text-white shadow-lg shadow-primary-500/30
                hover:from-primary-600 hover:to-primary-700
                hover:shadow-xl hover:shadow-primary-500/40
                focus:ring-primary-500
            `,
            secondary: `
                bg-white text-charcoal-800
                border border-charcoal-200 shadow-md
                hover:bg-charcoal-50 hover:border-charcoal-300
                hover:shadow-lg
                focus:ring-charcoal-400
            `,
            danger: `
                bg-gradient-to-r from-danger to-red-600
                text-white shadow-lg shadow-red-500/30
                hover:from-red-600 hover:to-red-700
                hover:shadow-xl hover:shadow-red-500/40
                focus:ring-red-500
            `,
            ghost: `
                bg-transparent text-charcoal-700
                hover:bg-charcoal-100 hover:text-charcoal-900
                focus:ring-charcoal-400
            `,
            outline: `
                bg-transparent text-primary-600
                border-2 border-primary-500
                hover:bg-primary-50 hover:border-primary-600
                focus:ring-primary-500
            `,
            gradient: `
                bg-gradient-to-r from-primary-500 via-teal-500 to-primary-600
                text-white shadow-lg
                hover:from-primary-600 hover:via-teal-600 hover:to-primary-700
                hover:shadow-xl
                focus:ring-primary-500
                background-size: 200% 200%;
                animation: gradientShift 3s ease infinite;
            `,
        };

        const sizeStyles = {
            xs: 'px-2.5 py-1 text-xs',
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-sm',
            lg: 'px-6 py-3 text-base',
            xl: 'px-8 py-4 text-lg',
        };

        const roundedStyles = {
            sm: 'rounded',
            md: 'rounded-md',
            lg: 'rounded-lg',
            full: 'rounded-full',
        };

        const glowStyles = glow
            ? 'after:absolute after:inset-0 after:rounded-inherit after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300 after:bg-gradient-to-r after:from-primary-400/20 after:to-teal-400/20 after:blur-xl after:-z-10'
            : '';

        const pulseStyles = pulse ? 'animate-pulse-subtle' : '';

        return (
            <button
                ref={ref}
                className={`
                    ${baseStyles}
                    ${variantStyles[variant]}
                    ${sizeStyles[size]}
                    ${roundedStyles[rounded]}
                    ${fullWidth ? 'w-full' : ''}
                    ${glowStyles}
                    ${pulseStyles}
                    ${className}
                `}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {!loading && icon && iconPosition === 'left' && icon}
                <span>{children}</span>
                {!loading && icon && iconPosition === 'right' && icon}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };

'use client';

import { InputHTMLAttributes, forwardRef, ReactNode, useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    success?: string;
    hint?: string;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    variant?: 'default' | 'filled' | 'underline' | 'glass';
    inputSize?: 'sm' | 'md' | 'lg';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            success,
            hint,
            icon,
            iconPosition = 'left',
            variant = 'default',
            inputSize = 'md',
            type = 'text',
            className = '',
            ...props
        },
        ref
    ) => {
        const [showPassword, setShowPassword] = useState(false);
        const [isFocused, setIsFocused] = useState(false);

        const isPassword = type === 'password';
        const inputType = isPassword && showPassword ? 'text' : type;

        const baseWrapperStyles = 'relative group';

        const sizeStyles = {
            sm: 'h-9 text-sm',
            md: 'h-11 text-base',
            lg: 'h-14 text-lg',
        };

        const variantStyles = {
            default: `
                bg-white border-2 rounded-xl
                transition-all duration-300
                ${error 
                    ? 'border-danger focus-within:border-danger focus-within:ring-2 focus-within:ring-danger/20' 
                    : success 
                        ? 'border-success focus-within:border-success focus-within:ring-2 focus-within:ring-success/20'
                        : 'border-charcoal-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20'
                }
                hover:border-charcoal-300
            `,
            filled: `
                bg-charcoal-100 border-2 border-transparent rounded-xl
                transition-all duration-300
                ${error 
                    ? 'border-danger focus-within:border-danger focus-within:bg-white' 
                    : success 
                        ? 'border-success focus-within:border-success focus-within:bg-white'
                        : 'focus-within:border-primary-500 focus-within:bg-white'
                }
                hover:bg-charcoal-200
            `,
            underline: `
                bg-transparent border-b-2 rounded-none
                transition-all duration-300
                ${error 
                    ? 'border-danger' 
                    : success 
                        ? 'border-success'
                        : 'border-charcoal-300 focus-within:border-primary-500'
                }
            `,
            glass: `
                bg-white/50 backdrop-blur-md border-2 rounded-xl
                transition-all duration-300
                ${error 
                    ? 'border-danger/50' 
                    : success 
                        ? 'border-success/50'
                        : 'border-white/30 focus-within:border-primary-500/50'
                }
            `,
        };

        const inputStyles = `
            w-full h-full bg-transparent
            outline-none
            placeholder:text-charcoal-400
            ${icon && iconPosition === 'left' ? 'pl-11' : 'pl-4'}
            ${icon && iconPosition === 'right' || isPassword ? 'pr-11' : 'pr-4'}
        `;

        return (
            <div className="space-y-1.5">
                {label && (
                    <label className="block text-sm font-medium text-charcoal-700 mb-1.5 transition-colors group-focus-within:text-primary-600">
                        {label}
                    </label>
                )}
                
                <div className={`${baseWrapperStyles} ${sizeStyles[inputSize]} ${variantStyles[variant]}`}>
                    {/* Left Icon */}
                    {icon && iconPosition === 'left' && (
                        <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                            isFocused ? 'text-primary-500' : 'text-charcoal-400'
                        }`}>
                            {icon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        type={inputType}
                        className={`${inputStyles} ${className}`}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        {...props}
                    />

                    {/* Right Icon or Password Toggle */}
                    {(icon && iconPosition === 'right' && !isPassword) && (
                        <div className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                            isFocused ? 'text-primary-500' : 'text-charcoal-400'
                        }`}>
                            {icon}
                        </div>
                    )}

                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600 transition-colors"
                        >
                            {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    )}

                    {/* Status Icon */}
                    {(error || success) && !isPassword && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {error && <AlertCircle className="w-5 h-5 text-danger" />}
                            {success && <CheckCircle className="w-5 h-5 text-success" />}
                        </div>
                    )}

                    {/* Focus Ring Animation */}
                    <div className={`
                        absolute inset-0 rounded-xl pointer-events-none
                        transition-all duration-300
                        ${isFocused ? 'ring-4 ring-primary-500/10' : ''}
                    `} />
                </div>

                {/* Hint/Error/Success Message */}
                {(error || success || hint) && (
                    <p className={`text-xs mt-1.5 flex items-center gap-1 ${
                        error ? 'text-danger' : success ? 'text-success' : 'text-charcoal-500'
                    }`}>
                        {error || success || hint}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };

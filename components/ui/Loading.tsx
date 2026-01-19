export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className="flex items-center justify-center">
            <div className={`${sizeClasses[size]} animate-spin`}>
                <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                    <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                    />
                    <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            </div>
        </div>
    );
}

export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="card-glass p-8 flex flex-col items-center gap-4">
                <LoadingSpinner size="lg" />
                <p className="text-charcoal-700 font-medium">{message}</p>
            </div>
        </div>
    );
}

export function LoadingState({ message = 'Loading data...' }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-charcoal-600 text-sm">{message}</p>
        </div>
    );
}

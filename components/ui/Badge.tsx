interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'secondary';
    size?: 'sm' | 'md';
    icon?: React.ReactNode;
}

export function Badge({ children, variant = 'secondary', size = 'md', icon }: BadgeProps) {
    const variantClasses = {
        success: 'badge-success',
        warning: 'badge-warning',
        danger: 'badge-danger',
        info: 'badge-info',
        primary: 'badge-primary',
        secondary: 'badge-secondary',
    };

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-xs px-2.5 py-1',
    };

    return (
        <span className={`badge ${variantClasses[variant]} ${sizeClasses[size]} gap-1`}>
            {icon}
            {children}
        </span>
    );
}

interface StatusBadgeProps {
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'DONE';
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const config = {
        ACTIVE: { variant: 'success' as const, label: 'Active', icon: '●' },
        INACTIVE: { variant: 'secondary' as const, label: 'Inactive', icon: '○' },
        PENDING: { variant: 'warning' as const, label: 'Pending', icon: '◐' },
        DONE: { variant: 'success' as const, label: 'Done', icon: '✓' },
    };

    const { variant, label, icon } = config[status];

    return (
        <Badge variant={variant}>
            <span className="text-xs">{icon}</span>
            {label}
        </Badge>
    );
}

interface RoleBadgeProps {
    role: 'ADMIN' | 'DISTRIBUTOR';
}

export function RoleBadge({ role }: RoleBadgeProps) {
    const config = {
        ADMIN: { 
            variant: 'primary' as const, 
            label: 'Admin',
            icon: (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
            )
        },
        DISTRIBUTOR: { 
            variant: 'info' as const, 
            label: 'Distributor',
            icon: (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
            )
        },
    };

    const { variant, label, icon } = config[role];

    return (
        <Badge variant={variant} icon={icon}>
            {label}
        </Badge>
    );
}

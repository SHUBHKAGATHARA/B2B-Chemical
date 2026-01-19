'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Building2,
    FileText,
    Settings,
    Newspaper,
    Beaker,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
    userRole: string;
}

export default function Sidebar({ userRole }: SidebarProps) {
    const pathname = usePathname();

    const adminLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/users', label: 'User Management', icon: Users },
        { href: '/dashboard/distributors', label: 'Distributors', icon: Building2 },
        { href: '/dashboard/pdfs', label: 'PDF Transfer', icon: FileText },
        { href: '/dashboard/news', label: 'News Upload', icon: Newspaper },
        { href: '/dashboard/settings', label: 'Company Settings', icon: Settings },
    ];

    const distributorLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/pdfs', label: 'My PDFs', icon: FileText },
    ];

    const links = userRole === 'ADMIN' ? adminLinks : distributorLinks;

    return (
        <aside className="w-64 bg-gradient-to-b from-green-50 via-white to-green-50 border-r border-green-200 min-h-screen fixed left-0 top-0 z-10 shadow-xl">
            {/* Logo - Chemical Theme */}
            <div className="h-16 flex items-center px-6 border-b border-green-200 bg-gradient-to-r from-green-600 to-green-700">
                <div className="flex items-center gap-3 animate-fadeIn">
                    <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg">
                        <Beaker className="w-6 h-6 text-green-600" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="font-bold text-white text-base tracking-tight">B2B Chemical</h2>
                        <p className="text-xs text-green-100 font-medium">Management Hub</p>
                    </div>
                </div>
            </div>

            {/* Navigation - Chemical Theme */}
            <nav className="p-4 space-y-1.5">
                {links.map((link, index) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || pathname.startsWith(link.href + '/');

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                'flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm group relative overflow-hidden',
                                isActive
                                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                                    : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                            )}
                            style={{ 
                                animationDelay: `${index * 0.05}s`,
                                animation: 'slideUp 0.3s ease-out forwards'
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    'w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200',
                                    isActive 
                                        ? 'bg-white/20' 
                                        : 'bg-charcoal-100 group-hover:bg-primary-100 group-hover:scale-105'
                                )}>
                                    <Icon 
                                        className={cn(
                                            'w-5 h-5 transition-all duration-200',
                                            isActive 
                                                ? 'text-white' 
                                                : 'text-charcoal-600 group-hover:text-primary-600'
                                        )} 
                                        strokeWidth={2}
                                    />
                                </div>
                                <span className="font-medium">{link.label}</span>
                            </div>
                            
                            {/* Active Indicator */}
                            {isActive ? (
                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                            ) : (
                                <ChevronRight className="w-4 h-4 text-charcoal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}

                            {/* Hover Glow Effect */}
                            {!isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg -z-10"></div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Status Badge - Refined */}
            <div className="absolute bottom-6 left-4 right-4">
                <div className="card-glass p-4 border border-primary-200/50">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500/50"></div>
                        <span className="text-xs font-bold text-charcoal-800 uppercase tracking-wide">System Status</span>
                    </div>
                    <p className="text-xs text-charcoal-600 font-medium">All systems operational</p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-charcoal-500">
                        <div className="w-full bg-charcoal-200 h-1 rounded-full overflow-hidden">
                            <div className="w-[95%] h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                        </div>
                        <span className="text-xs font-semibold text-emerald-600">95%</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}


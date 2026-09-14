'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    User,
    Building2,
    FileText,
    Newspaper,
    Beaker,
    LogOut,
    Settings,
    AlertCircle,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
    userRole: string;
}

export default function Sidebar({ userRole }: SidebarProps) {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const handleToggle = () => setIsMobileOpen((prev) => !prev);
        const handleClose = () => setIsMobileOpen(false);

        window.addEventListener('toggle-mobile-sidebar', handleToggle);
        window.addEventListener('resize', handleClose);

        return () => {
            window.removeEventListener('toggle-mobile-sidebar', handleToggle);
            window.removeEventListener('resize', handleClose);
        };
    }, []);

    // Close mobile sidebar on route navigation
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    const adminSections = [
        {
            title: 'OVERVIEW',
            links: [
                { href: '/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
            ]
        },
        {
            title: 'MANAGEMENT',
            links: [
                { href: '/dashboard/users', label: 'User Management', icon: Users },
                { href: '/dashboard/distributors', label: 'Distributors', icon: Building2 },
                { href: '/dashboard/alerts', label: 'Alerts Management', icon: AlertCircle },
            ]
        },
        {
            title: 'CONTENT & TRANSFERS',
            links: [
                { href: '/dashboard/pdfs', label: 'PDF Transfer', icon: FileText },
                { href: '/dashboard/news', label: 'News Transfer', icon: Newspaper },
            ]
        },
        {
            title: 'SETTINGS',
            links: [
                { href: '/dashboard/profile', label: 'My Profile', icon: User },
            ]
        },
    ];

    const distributorSections = [
        {
            title: 'OVERVIEW',
            links: [
                { href: '/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
            ]
        },
        {
            title: 'CONTENT',
            links: [
                { href: '/dashboard/pdfs', label: 'My PDFs', icon: FileText },
                { href: '/dashboard/news', label: 'News & Updates', icon: Newspaper },
            ]
        },
        {
            title: 'SETTINGS',
            links: [
                { href: '/dashboard/profile', label: 'My Profile', icon: User },
            ]
        },
    ];

    const sections = userRole === 'ADMIN' ? adminSections : distributorSections;

    const sidebarContent = (
        <>
            {/* Logo */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200 flex-shrink-0">
                <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setIsMobileOpen(false)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/spentica-logo.png"
                        alt="Spentica Chemicals"
                        className="w-10 h-10 object-contain flex-shrink-0"
                    />
                    <div className="flex flex-col leading-tight">
                        <span className="font-black text-gray-900 text-base tracking-tight">Spentica</span>
                        <span className="font-bold text-[#2E7D32] text-sm tracking-tight -mt-0.5">Chemicals</span>
                    </div>
                </Link>
                {/* Close Button on Mobile */}
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    aria-label="Close navigation"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 scrollbar-thin">
                {sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className={sectionIndex > 0 ? 'mt-8' : ''}>
                        <h3 className="px-3 mb-3 text-xs font-bold text-gray-700 uppercase tracking-wider">
                            {section.title}
                        </h3>
                        <div className="space-y-1">
                            {section.links.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={cn(
                                            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium group',
                                            isActive
                                                ? 'bg-teal-50 text-teal-700 font-semibold'
                                                : 'text-gray-800 hover:bg-gray-100 hover:text-gray-900'
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                'w-5 h-5 flex-shrink-0',
                                                isActive ? 'text-teal-600' : 'text-gray-500 group-hover:text-gray-700'
                                            )}
                                            strokeWidth={2}
                                        />
                                        <span>{link.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Support Section */}
            <div className="p-4 border-t border-gray-200 flex-shrink-0">
                <div className="bg-orange-50 rounded-lg p-4 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-orange-600">SP</span>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-900">Support Team</p>
                            <p className="text-xs text-gray-600">Online 24/7</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-700 mb-3 font-medium">Need Help?</p>
                    <p className="text-xs text-gray-600">Check our docs or contact support.</p>
                </div>

                <Link
                    href="/login"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-800 hover:bg-red-50 hover:text-red-600 transition-colors border border-gray-200 hover:border-red-200"
                >
                    <LogOut className="w-5 h-5" strokeWidth={2} />
                    <span>Log Out</span>
                </Link>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 z-30 flex flex-col hidden lg:flex overflow-hidden">
                {sidebarContent}
            </aside>

            {/* Mobile Backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Mobile Drawer */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:hidden',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {sidebarContent}
            </aside>
        </>
    );
}

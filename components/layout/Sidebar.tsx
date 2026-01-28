'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Building2,
    FileText,
    Newspaper,
    Beaker,
    LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
    userRole: string;
}

export default function Sidebar({ userRole }: SidebarProps) {
    const pathname = usePathname();

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
            ]
        },
        {
            title: 'CONTENT & TRANSFERS',
            links: [
                { href: '/dashboard/pdfs', label: 'PDF Transfer', icon: FileText },
                { href: '/dashboard/news', label: 'News Transfer', icon: Newspaper },
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
    ];

    const sections = userRole === 'ADMIN' ? adminSections : distributorSections;

    return (
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 z-10 flex flex-col">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-gray-200">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                        <Beaker className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 text-base">SpentiCachemicals</h2>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-4">
                {sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className={sectionIndex > 0 ? 'mt-8' : ''}>
                        <h3 className="px-3 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                                        className={cn(
                                            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium group',
                                            isActive
                                                ? 'bg-teal-50 text-teal-700'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                'w-5 h-5 flex-shrink-0',
                                                isActive ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-600'
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
            <div className="p-4 border-t border-gray-200">
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
                    <p className="text-xs text-gray-600 mb-3">Need Help?</p>
                    <p className="text-xs text-gray-500">Check our docs or contact support.</p>
                </div>

                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <LogOut className="w-5 h-5 text-gray-400" strokeWidth={2} />
                    <span>Log Out</span>
                </button>
            </div>
        </aside>
    );
}

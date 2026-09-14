'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, LogIn, LayoutDashboard, ArrowRight } from 'lucide-react';

interface NavLink {
    href: string;
    label: string;
}

interface PublicNavbarProps {
    links: NavLink[];
    isLoggedIn?: boolean;
    activeHref?: string;
}

export default function PublicNavbar({
    links,
    isLoggedIn = false,
}: PublicNavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-0" aria-label="Primary navigation">
                {links.map(({ href, label }) => (
                    <Link
                        key={label}
                        href={href}
                        className="px-4 py-2 font-sans text-[11px] font-bold uppercase tracking-widest text-[#111111] border-r border-[#111111] hover:bg-[#111111] hover:text-[#F9F9F7] transition-colors duration-200 min-h-[44px] flex items-center"
                    >
                        {label}
                    </Link>
                ))}
            </nav>

            {/* Desktop CTA & Mobile Toggle Button */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {/* CTA (visible on desktop and tablet) */}
                {isLoggedIn ? (
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#111111] text-[#F9F9F7] hover:bg-[#2E7D32] transition-colors duration-200 font-sans text-xs font-bold uppercase tracking-widest sharp-corners min-h-[40px] sm:min-h-[44px]"
                    >
                        <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} />
                        <span className="hidden xs:inline">Dashboard</span>
                    </Link>
                ) : (
                    <Link
                        href="/login"
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#111111] text-[#F9F9F7] hover:bg-[#2E7D32] transition-colors duration-200 font-sans text-xs font-bold uppercase tracking-widest sharp-corners min-h-[40px] sm:min-h-[44px]"
                    >
                        <LogIn className="w-4 h-4" strokeWidth={1.5} />
                        <span className="hidden xs:inline">Distributor Login</span>
                        <span className="xs:hidden">Login</span>
                    </Link>
                )}

                {/* Mobile Hamburger Button */}
                <button
                    type="button"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 text-[#111111] hover:bg-[#111111] hover:text-[#F9F9F7] border border-[#111111] transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center sharp-corners"
                    aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    aria-expanded={mobileMenuOpen}
                >
                    {mobileMenuOpen ? (
                        <X className="w-5 h-5" strokeWidth={2} />
                    ) : (
                        <Menu className="w-5 h-5" strokeWidth={2} />
                    )}
                </button>
            </div>

            {/* Mobile Slide-Down Drawer */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 top-[90px] sm:top-[98px] z-50 bg-[#111111]/60 backdrop-blur-sm md:hidden animate-fadeIn"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    <div
                        className="bg-[#F9F9F7] border-b-4 border-[#111111] p-6 shadow-2xl flex flex-col gap-3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="font-mono-data text-[10px] uppercase tracking-widest text-[#737373] pb-2 border-b border-[#E5E5E0]">
                            Platform Navigation
                        </p>

                        <div className="flex flex-col divide-y divide-[#E5E5E0]">
                            {links.map(({ href, label }) => (
                                <Link
                                    key={label}
                                    href={href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="py-3.5 flex items-center justify-between font-sans text-xs font-bold uppercase tracking-widest text-[#111111] hover:text-[#2E7D32] transition-colors"
                                >
                                    <span>{label}</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-[#737373]" />
                                </Link>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-[#111111] mt-2">
                            {isLoggedIn ? (
                                <Link
                                    href="/dashboard"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#111111] text-[#F9F9F7] font-sans text-xs font-bold uppercase tracking-widest sharp-corners"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Access Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#111111] text-[#F9F9F7] font-sans text-xs font-bold uppercase tracking-widest sharp-corners"
                                >
                                    <LogIn className="w-4 h-4" />
                                    Distributor Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

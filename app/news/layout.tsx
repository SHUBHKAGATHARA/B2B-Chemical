import type { Metadata } from 'next';
import Link from 'next/link';
import PublicNavbar from '@/components/layout/PublicNavbar';
import { Newspaper, LogIn, FlaskConical, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Industry News & Insights | Spentica Chemicals',
    description:
        'Stay informed with the latest chemical industry updates, product launches, regulatory news, and company announcements from Spentica Chemicals.',
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
    const today = new Date();
    const edition = `Vol. I · ${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · Global Edition`;

    return (
        <div className="newsprint-page min-h-screen text-[#111111]">

            {/* ── Header ── */}
            <header className="sticky top-0 z-40 bg-[#F9F9F7] border-b-4 border-[#111111]">
                {/* Edition line */}
                <div className="border-b border-[#111111]">
                    <div className="max-w-screen-xl mx-auto px-4 py-1 flex items-center justify-between">
                        <p className="font-mono-data text-[10px] uppercase tracking-widest text-[#737373]">{edition}</p>
                        <p className="font-mono-data text-[10px] uppercase tracking-widest text-[#737373] hidden sm:block">
                            Chemical Supply Chain Intelligence
                        </p>
                    </div>
                </div>

                {/* Nav row */}
                <div className="max-w-screen-xl mx-auto px-4">
                    <div className="flex items-center justify-between h-14 sm:h-16 gap-4">

                        {/* Wordmark */}
                        <Link href="/" className="flex flex-col items-center group flex-shrink-0" aria-label="Spentica Chemicals home">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/spentica-logo.png" alt="Spentica Chemicals" className="w-10 h-10 object-contain" />
                            <span className="font-serif-display text-[13px] font-black tracking-tight leading-none text-[#111111] mt-1">
                                Spentica<span className="text-[#2E7D32]"> Chemicals</span>
                            </span>
                        </Link>

                        {/* Responsive Navigation & Actions */}
                        <PublicNavbar
                            links={[
                                { href: '/', label: 'Home' },
                                { href: '/#who-we-are', label: 'Who We Are' },
                                { href: '/news', label: 'Latest News' },
                            ]}
                        />
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <main>{children}</main>

            {/* ── Footer ── */}
            <footer className="bg-[#111111] border-t-4 border-[#111111] mt-0">
                <div className="max-w-screen-xl mx-auto px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-[#F9F9F7]/10 py-10 gap-8">

                        {/* Brand */}
                        <div className="sm:border-r border-[#F9F9F7]/10 sm:pr-8">
                            <div className="flex items-center gap-2 mb-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/spentica-logo.png" alt="Spentica Chemicals" className="w-8 h-8 object-contain brightness-0 invert" />
                                <span className="font-serif-display text-xl font-black text-[#F9F9F7]">Spentica Chemicals</span>
                            </div>
                            <p className="font-body-serif text-sm text-[#A3A3A3] leading-relaxed">
                                A professional B2B platform for chemical distributors.
                                Secure document sharing, industry news, and business insights.
                            </p>
                        </div>

                        {/* Categories */}
                        <div className="sm:border-r border-[#F9F9F7]/10 sm:px-8">
                            <h4 className="font-mono-data text-[10px] font-bold uppercase tracking-[0.25em] text-[#F9F9F7] mb-4">
                                Categories
                            </h4>
                            <ul className="space-y-2">
                                {[
                                    { label: 'All News', cat: '' },
                                    { label: 'General Announcement', cat: 'General Announcement' },
                                    { label: 'Industry Update', cat: 'Industry Update' },
                                    { label: 'Product Launch', cat: 'Product Launch' },
                                    { label: 'Company News', cat: 'Company News' },
                                    { label: 'Regulatory', cat: 'Regulatory' },
                                ].map(({ label, cat }) => (
                                    <li key={label}>
                                        <Link
                                            href={cat ? `/news?category=${encodeURIComponent(cat)}` : '/news'}
                                            className="font-body-serif text-sm text-[#A3A3A3] hover:text-[#F9F9F7] transition-colors"
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Portal CTA */}
                        <div className="sm:pl-8">
                            <h4 className="font-mono-data text-[10px] font-bold uppercase tracking-[0.25em] text-[#F9F9F7] mb-4">
                                Distributor Portal
                            </h4>
                            <p className="font-body-serif text-sm text-[#A3A3A3] mb-4 leading-relaxed">
                                Authorized distributors can log in to access shared documents and receive personalized updates.
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#F9F9F7]/20 text-[#F9F9F7] hover:bg-[#F9F9F7] hover:text-[#111111] transition-colors duration-200 font-sans text-xs font-bold uppercase tracking-widest sharp-corners"
                            >
                                Access Your Account
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>

                    <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="font-mono-data text-[11px] uppercase tracking-widest text-[#525252]">
                            © {new Date().getFullYear()} Spentica Chemicals. All rights reserved.
                        </p>
                        <p className="font-mono-data text-[11px] uppercase tracking-widest text-[#525252]">
                            Public news is open to all · Private documents require authorization
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

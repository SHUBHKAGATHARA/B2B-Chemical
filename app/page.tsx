import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import PublicNavbar from '@/components/layout/PublicNavbar';
import {
    FlaskConical,
    ShieldCheck,
    FileText,
    Bell,
    Newspaper,
    TrendingUp,
    Sparkles,
    ArrowRight,
    LogIn,
    LayoutDashboard,
    Users,
    Globe2,
    Zap,
    ChevronRight,
    Clock,
    Calendar,
    HelpCircle,
    Plus,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const dynamic = 'force-dynamic';

/* ── helpers ─────────────────────────────────────────── */
function getCategoryLabel(category: string) {
    const map: Record<string, string> = {
        'Industry Update': 'Industry',
        'Product Launch': 'Launch',
        'Regulatory': 'Regulatory',
        'Company News': 'Company',
    };
    return map[category] ?? category;
}

/* ── page ─────────────────────────────────────────────── */
export default async function HomePage() {
    const session = await getSession();

    let latestNews: any[] = [];
    try {
        latestNews = await prisma.news.findMany({
            take: 3,
            orderBy: { publishDate: 'desc' },
            include: {
                author: { select: { fullName: true } },
            },
        });
    } catch (error) {
        console.error('Failed to fetch latest news on HomePage:', error);
    }

    const today = new Date();
    const edition = `Vol. I · ${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · Global Edition`;

    /* ticker content — repeated once so CSS can loop it */
    const tickerItems = [
        'Chemical Sector Intelligence',
        'COA & TDS Document Exchange',
        'Regulatory Compliance Alerts',
        'Verified Distributor Network',
        'Real-Time Market Briefings',
        'Encrypted Document Transfers',
        'Push & In-App Notifications',
        'ISO Audit-Ready Records',
    ];

    return (
        <div className="newsprint-page min-h-screen text-[#111111] selection:bg-[#CC0000] selection:text-white">

            {/* ══════════════════════════════════════════
                BREAKING-NEWS TICKER
            ══════════════════════════════════════════ */}
            <div className="bg-[#111111] text-white overflow-hidden border-b-4 border-[#CC0000]" role="marquee" aria-label="Breaking news ticker">
                <div className="flex items-center">
                    {/* BREAKING label */}
                    <div className="flex-shrink-0 bg-[#CC0000] px-4 py-2 text-white text-[10px] font-mono-data font-bold uppercase tracking-[0.2em] z-10">
                        ● Breaking
                    </div>
                    {/* Scrolling tape */}
                    <div className="overflow-hidden flex-1">
                        <div className="animate-np-marquee">
                            {[...tickerItems, ...tickerItems].map((item, i) => (
                                <span key={i} className="font-mono-data text-[11px] font-medium uppercase tracking-widest px-8 py-2 inline-flex items-center gap-4 text-[#A3A3A3]">
                                    <span className="text-[#CC0000]">◆</span>
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════
                HEADER
            ══════════════════════════════════════════ */}
            <header className="sticky top-0 z-40 bg-[#F9F9F7] border-b-4 border-[#111111]" role="banner">
                {/* Edition line */}
                <div className="border-b border-[#111111] bg-[#F9F9F7]">
                    <div className="max-w-screen-xl mx-auto px-4 py-1 flex items-center justify-between">
                        <p className="font-mono-data text-[10px] uppercase tracking-widest text-[#737373]">{edition}</p>
                        <p className="font-mono-data text-[10px] uppercase tracking-widest text-[#737373] hidden sm:block">Est. 2024 · Chemical Supply Chain</p>
                    </div>
                </div>

                {/* Main nav row */}
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
                                { href: '#who-we-are', label: 'Who We Are' },
                                { href: '#capabilities', label: 'Platform' },
                                { href: '/news', label: 'Industry News' },
                                { href: '#faq', label: 'FAQ' },
                            ]}
                            isLoggedIn={!!session}
                        />
                    </div>
                </div>
            </header>

            {/* ══════════════════════════════════════════
                HERO
            ══════════════════════════════════════════ */}
            <section className="newsprint-texture border-b-4 border-[#111111] overflow-hidden" aria-labelledby="hero-headline">
                <div className="max-w-screen-xl mx-auto px-4">

                    {/* Top rule */}
                    <div className="grid grid-cols-12 border-b border-[#111111] py-3">
                        <div className="col-span-12 flex items-center gap-3">
                            <span className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-[#737373]">Chemical Industry</span>
                            <span className="flex-1 border-t border-dashed border-[#E5E5E0]" />
                            <span className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-[#CC0000]">● Live Updates</span>
                        </div>
                    </div>

                    {/* Asymmetric hero grid: 8 / 4 */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-[#111111]">

                        {/* Left — main headline */}
                        <div className="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-[#111111] py-10 lg:py-16 pr-0 lg:pr-10 flex flex-col justify-between gap-8">

                            {/* Label */}
                            <div className="inline-flex items-center gap-2">
                                <span className="bg-[#CC0000] text-white font-mono-data text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1">
                                    Breaking
                                </span>
                                <span className="font-mono-data text-[10px] uppercase tracking-widest text-[#737373]">Platform Intelligence</span>
                            </div>

                            {/* Headline */}
                            <div>
                                <h1
                                    id="hero-headline"
                                    className="font-serif-display font-black leading-[0.9] tracking-tighter text-[#111111]"
                                    style={{ fontSize: 'clamp(3rem, 8vw, 8rem)' }}
                                >
                                    The B2B<br />
                                    <em className="not-italic text-[#CC0000]">Chemical</em><br />
                                    Distribution<br />
                                    Platform.
                                </h1>

                                <p className="font-body-serif text-base sm:text-lg text-[#525252] leading-relaxed mt-6 max-w-xl text-justify np-dropcap">
                                    Spentica Chemicals connects verified chemical manufacturers and distributors worldwide.
                                    Stay ahead with public industry news, automated compliance alerts, and
                                    encrypted Certificate of Analysis transfers — all in one authoritative platform.
                                </p>
                            </div>

                            {/* CTA buttons */}
                            <div className="flex flex-col sm:flex-row gap-0 border border-[#111111]">
                                <Link
                                    href="/news"
                                    id="hero-explore-news"
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#111111] text-[#F9F9F7] hover:bg-[#CC0000] transition-colors duration-200 font-sans text-sm font-bold uppercase tracking-widest border-b sm:border-b-0 sm:border-r border-[#F9F9F7]/20"
                                >
                                    <Newspaper className="w-4 h-4" strokeWidth={1.5} />
                                    Explore Industry News
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href={session ? '/dashboard' : '/login'}
                                    id="hero-portal-login"
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#F9F9F7] text-[#111111] hover:bg-[#E5E5E0] transition-colors duration-200 font-sans text-sm font-bold uppercase tracking-widest"
                                >
                                    <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
                                    {session ? 'Access Dashboard' : 'Distributor Portal'}
                                </Link>
                            </div>
                        </div>

                        {/* Right — stats column */}
                        <div className="lg:col-span-4 py-10 lg:py-0 pl-0 lg:pl-8 flex flex-col justify-around gap-0">
                            {[
                                { value: 'Public', label: 'Free Industry News', desc: 'No account required' },
                                { value: 'Encrypted', label: 'COA & TDS Transfers', desc: 'Zero-knowledge distribution' },
                                { value: 'Real-Time', label: 'Push & In-App Alerts', desc: 'Multi-channel delivery' },
                                { value: 'Verified', label: 'Partner Network', desc: 'Role-based access control' },
                            ].map(({ value, label, desc }, i) => (
                                <div key={i} className="border-b border-[#E5E5E0] last:border-b-0 py-5 first:pt-0 last:pb-0">
                                    <div className="font-serif-display font-black text-3xl text-[#111111] leading-none">{value}</div>
                                    <div className="font-sans text-xs font-bold uppercase tracking-widest text-[#111111] mt-1">{label}</div>
                                    <div className="font-mono-data text-[11px] text-[#737373] mt-0.5">{desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                WHO WE ARE
            ══════════════════════════════════════════ */}
            <section id="who-we-are" className="border-b-4 border-[#111111]" aria-labelledby="who-we-are-heading">
                <div className="max-w-screen-xl mx-auto px-4">

                    {/* Section header */}
                    <div className="border-b border-[#111111] py-4 flex items-center gap-4">
                        <span className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-[#CC0000] font-bold">§ Section 01</span>
                        <h2 id="who-we-are-heading" className="font-serif-display font-black text-2xl sm:text-3xl text-[#111111]">
                            Who We Are
                        </h2>
                    </div>

                    {/* Intro */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-[#111111]">
                        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[#111111] py-10 pr-0 lg:pr-10">
                            <p className="font-body-serif text-lg text-[#111111] leading-relaxed text-justify">
                                Spentica Chemicals is the dedicated digital infrastructure built specifically for the chemical manufacturing
                                and distribution ecosystem. We empower producers, distributors, and trading partners
                                to eliminate paper-based bottlenecks, ensure regulatory compliance, and access critical market intelligence.
                            </p>
                            <blockquote className="mt-6 border-l-4 border-[#CC0000] pl-5">
                                <p className="font-serif-display text-xl italic font-semibold text-[#111111]">
                                    "To digitize and safeguard the critical flow of technical documents and market intelligence
                                    in the chemical industry."
                                </p>
                                <footer className="mt-2 font-mono-data text-xs uppercase tracking-widest text-[#737373]">
                                    — Our Mission Statement
                                </footer>
                            </blockquote>
                        </div>
                        <div className="lg:col-span-5 py-10 pl-0 lg:pl-8 flex flex-col gap-4 justify-center">
                            <div className="flex items-start gap-4">
                                <Link href="/news" className="mt-1 flex-shrink-0 w-10 h-10 border-2 border-[#111111] flex items-center justify-center hover:bg-[#111111] hover:text-[#F9F9F7] transition-colors group sharp-corners" aria-label="Browse News Hub">
                                    <Newspaper className="w-5 h-5" strokeWidth={1.5} />
                                </Link>
                                <div>
                                    <div className="font-sans text-xs font-bold uppercase tracking-widest">Browse News Hub</div>
                                    <div className="font-body-serif text-sm text-[#525252] mt-0.5">Open-access industry bulletins and market updates.</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Link href="/login" className="mt-1 flex-shrink-0 w-10 h-10 border-2 border-[#111111] flex items-center justify-center hover:bg-[#111111] hover:text-[#F9F9F7] transition-colors group sharp-corners" aria-label="Login">
                                    <LogIn className="w-5 h-5" strokeWidth={1.5} />
                                </Link>
                                <div>
                                    <div className="font-sans text-xs font-bold uppercase tracking-widest">Distributor Login</div>
                                    <div className="font-body-serif text-sm text-[#525252] mt-0.5">Access your private document portal and COA library.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4-pillar grid — collapsed borders */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                icon: Newspaper,
                                title: 'Open Industry News',
                                body: 'No login required. Real-time market updates, pricing trends, supply chain disruptions, and regulatory bulletins.',
                            },
                            {
                                icon: FileText,
                                title: 'Secure PDF & COA Transfer',
                                body: 'Encrypted distribution of Certificates of Analysis, Technical Data Sheets, and MSDS to designated distributors.',
                            },
                            {
                                icon: Bell,
                                title: 'Instant Notifications',
                                body: 'Never miss an urgent document batch or regulatory announcement. Multi-channel push and in-app alerts.',
                            },
                            {
                                icon: ShieldCheck,
                                title: 'Verified Partner Network',
                                body: 'Access-controlled ecosystem ensuring only authenticated, compliant distributors can access proprietary documents.',
                            },
                        ].map(({ icon: Icon, title, body }, i) => (
                            <div
                                key={i}
                                className={`p-6 sm:p-8 border-b border-[#111111] hard-shadow-hover group cursor-default
                                    ${i < 3 ? 'lg:border-r' : ''}
                                    ${i < 2 ? 'sm:border-r' : ''}
                                `}
                            >
                                <div className="w-10 h-10 border border-[#111111] flex items-center justify-center mb-5 group-hover:bg-[#111111] group-hover:text-[#F9F9F7] transition-colors duration-200 sharp-corners">
                                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                                </div>
                                <h3 className="font-serif-display font-bold text-lg text-[#111111] mb-2">{title}</h3>
                                <p className="font-body-serif text-sm text-[#525252] leading-relaxed">{body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Ornamental divider */}
            <div className="py-6 text-center font-serif-display text-2xl text-[#E5E5E0] tracking-[0.75em] select-none border-b border-[#E5E5E0]">
                ✦ ✦ ✦
            </div>

            {/* ══════════════════════════════════════════
                LATEST NEWS
            ══════════════════════════════════════════ */}
            <section id="news" className="border-b-4 border-[#111111]" aria-labelledby="news-heading">
                <div className="max-w-screen-xl mx-auto px-4">

                    {/* Section header */}
                    <div className="border-b border-[#111111] py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-4">
                            <span className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-[#CC0000] font-bold">§ Section 02</span>
                            <h2 id="news-heading" className="font-serif-display font-black text-2xl sm:text-3xl text-[#111111]">
                                Latest Chemical Industry News
                            </h2>
                        </div>
                        <Link
                            href="/news"
                            className="inline-flex items-center gap-1.5 font-sans text-[11px] font-bold uppercase tracking-widest text-[#111111] hover:text-[#CC0000] transition-colors group"
                        >
                            View All Articles
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>

                    {/* News grid */}
                    {latestNews.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3">
                            {latestNews.map((article, idx) => {
                                const readingTime = Math.max(1, Math.ceil((article.content || '').split(/\s+/).length / 200));
                                const categoryLabel = getCategoryLabel(article.category);
                                return (
                                    <article
                                        key={article.id}
                                        className={`flex flex-col border-b border-[#111111] hard-shadow-hover group
                                            ${idx < latestNews.length - 1 ? 'md:border-r' : ''}
                                        `}
                                    >
                                        {/* Image or halftone placeholder */}
                                        {article.imageUrl ? (
                                            <div className="h-44 w-full overflow-hidden border-b border-[#111111]">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={article.imageUrl}
                                                    alt={article.title}
                                                    className="w-full h-full object-cover np-img-grayscale"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-32 w-full border-b border-[#111111] relative overflow-hidden bg-[#F5F5F5]">
                                                <div className="np-halftone absolute inset-0" aria-hidden="true" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <FlaskConical className="w-10 h-10 text-[#111111] opacity-10" strokeWidth={1} />
                                                </div>
                                            </div>
                                        )}

                                        <div className="p-6 flex-1 flex flex-col gap-4">
                                            {/* Category & meta */}
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-mono-data text-[10px] font-bold uppercase tracking-[0.2em] text-[#CC0000] border border-[#CC0000] px-1.5 py-0.5 sharp-corners">
                                                    {categoryLabel}
                                                </span>
                                                <div className="flex items-center gap-1 font-mono-data text-[10px] text-[#737373]">
                                                    <Clock className="w-3 h-3" />
                                                    {readingTime} min read
                                                </div>
                                            </div>

                                            {/* Title */}
                                            <h3 className="font-serif-display font-bold text-xl text-[#111111] leading-tight group-hover:text-[#CC0000] transition-colors duration-200">
                                                <Link href={`/news/${article.id}`}>{article.title}</Link>
                                            </h3>

                                            {/* Excerpt */}
                                            <p className="font-body-serif text-sm text-[#525252] leading-relaxed line-clamp-3 text-justify flex-1">
                                                {article.content}
                                            </p>

                                            {/* Footer */}
                                            <div className="flex items-center justify-between border-t border-[#E5E5E0] pt-4">
                                                <div className="flex items-center gap-1 font-mono-data text-[10px] text-[#737373]">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDistanceToNow(new Date(article.publishDate), { addSuffix: true })}
                                                </div>
                                                <Link
                                                    href={`/news/${article.id}`}
                                                    className="inline-flex items-center gap-1 font-sans text-[11px] font-bold uppercase tracking-widest text-[#111111] hover:text-[#CC0000] transition-colors"
                                                >
                                                    Read More
                                                    <ArrowRight className="w-3 h-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-16 text-center border-b border-[#111111]">
                            <Newspaper className="w-12 h-12 text-[#E5E5E0] mx-auto mb-4" strokeWidth={1} />
                            <h3 className="font-serif-display font-bold text-xl text-[#111111]">No News Published Yet</h3>
                            <p className="font-body-serif text-sm text-[#737373] mt-2">
                                Check back shortly for industry briefings and product launch updates.
                            </p>
                        </div>
                    )}

                    {/* Archive CTA */}
                    <div className="py-6 flex justify-center border-b border-[#111111]">
                        <Link
                            href="/news"
                            id="news-archive-link"
                            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-[#111111] bg-transparent hover:bg-[#111111] hover:text-[#F9F9F7] transition-all duration-200 font-sans text-xs font-bold uppercase tracking-widest sharp-corners"
                        >
                            Browse Complete News Archive
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                PLATFORM CAPABILITIES (inverted)
            ══════════════════════════════════════════ */}
            <section id="capabilities" className="bg-[#111111] border-b-4 border-[#CC0000]" aria-labelledby="capabilities-heading">
                <div className="max-w-screen-xl mx-auto px-4">

                    {/* Section header */}
                    <div className="border-b border-[#F9F9F7]/20 py-4 flex items-center gap-4">
                        <span className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-[#CC0000] font-bold">§ Section 03</span>
                        <h2 id="capabilities-heading" className="font-serif-display font-black text-2xl sm:text-3xl text-[#F9F9F7]">
                            Platform Capabilities
                        </h2>
                    </div>

                    {/* Sub-headline */}
                    <div className="py-8 border-b border-[#F9F9F7]/10">
                        <p className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-black italic text-[#F9F9F7] leading-tight max-w-3xl">
                            "Built for high-stakes chemical operations — from ISO audit compliance to
                            fast distributor communication."
                        </p>
                    </div>

                    {/* 3-column capabilities */}
                    <div className="grid grid-cols-1 md:grid-cols-3">
                        {[
                            {
                                num: '01',
                                icon: Zap,
                                title: 'Automated Dispatch',
                                body: 'Upload a batch Certificate of Analysis once and automatically map it to authorized distributors with real-time alerts and mobile push triggers.',
                            },
                            {
                                num: '02',
                                icon: ShieldCheck,
                                title: 'Zero-Trust Access Control',
                                body: 'Role-based access ensures confidential trade formulas and test results are only viewed by intended distributor accounts, secured with JWT sessions.',
                            },
                            {
                                num: '03',
                                icon: Globe2,
                                title: 'Global Industry Reach',
                                body: 'Keep every partner informed whether they operate bulk petrochemical tanks, specialty reagents, or agrochemical blending facilities worldwide.',
                            },
                        ].map(({ num, icon: Icon, title, body }, i) => (
                            <div
                                key={i}
                                className={`p-8 border-b border-[#F9F9F7]/10 md:border-b-0 group
                                    ${i < 2 ? 'md:border-r md:border-[#F9F9F7]/10' : ''}
                                `}
                            >
                                <div className="font-mono-data text-5xl font-bold text-[#CC0000] leading-none mb-4">{num}</div>
                                <div className="w-10 h-10 border border-[#F9F9F7]/30 flex items-center justify-center mb-5 group-hover:bg-[#CC0000] group-hover:border-[#CC0000] transition-colors duration-200 sharp-corners">
                                    <Icon className="w-5 h-5 text-[#F9F9F7]" strokeWidth={1.5} />
                                </div>
                                <h3 className="font-serif-display font-bold text-xl text-[#F9F9F7] mb-3">{title}</h3>
                                <p className="font-body-serif text-sm text-[#A3A3A3] leading-relaxed">{body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                FAQ
            ══════════════════════════════════════════ */}
            <section id="faq" className="border-b-4 border-[#111111]" aria-labelledby="faq-heading">
                <div className="max-w-screen-xl mx-auto px-4">

                    {/* Section header */}
                    <div className="border-b border-[#111111] py-4 flex items-center gap-4">
                        <span className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-[#CC0000] font-bold">§ Section 04</span>
                        <h2 id="faq-heading" className="font-serif-display font-black text-2xl sm:text-3xl text-[#111111]">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    {/* FAQ items */}
                    <div className="divide-y divide-[#E5E5E0]">
                        {[
                            {
                                id: 'faq-1',
                                q: 'Can I view industry news without logging in?',
                                a: 'Yes. All news bulletins, regulatory overviews, and product announcements published on Spentica Chemicals are open to the entire chemical community without requiring an account or login.',
                            },
                            {
                                id: 'faq-2',
                                q: 'Why do I need to log in to access Certificates of Analysis (COA)?',
                                a: 'Certificates of Analysis, batch test records, and material safety data contain proprietary specifications and compliance data. To comply with industry standards and client confidentiality, these documents are strictly restricted to verified distributor accounts.',
                            },
                            {
                                id: 'faq-3',
                                q: 'How do distributors receive notifications for new documents or news?',
                                a: 'Whenever an administrator transfers a PDF or publishes critical news, our multi-channel notification engine creates an in-app alert with direct deep links, and dispatches push notifications to registered devices.',
                            },
                            {
                                id: 'faq-4',
                                q: 'Is the document transfer process auditable for compliance?',
                                a: 'Yes. Every document transfer generates a timestamped receipt log. Manufacturers can confirm delivery to specific distributor accounts, providing an immutable audit trail compatible with ISO and GMP requirements.',
                            },
                        ].map(({ id, q, a }) => (
                            <details key={id} id={id} className="group py-0 open:bg-[#F5F5F5]">
                                <summary className="flex items-center justify-between gap-4 py-6 cursor-pointer list-none font-serif-display font-bold text-lg text-[#111111] hover:text-[#CC0000] transition-colors">
                                    <span className="flex items-center gap-3">
                                        <HelpCircle className="w-4 h-4 text-[#CC0000] flex-shrink-0" strokeWidth={1.5} />
                                        {q}
                                    </span>
                                    <Plus className="w-5 h-5 flex-shrink-0 text-[#111111] group-open:rotate-45 transition-transform duration-200" strokeWidth={2} />
                                </summary>
                                <p className="font-body-serif text-base text-[#525252] leading-relaxed pb-6 pl-7">
                                    {a}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                CTA BLOCK
            ══════════════════════════════════════════ */}
            <section className="newsprint-texture bg-[#F9F9F7] border-b-4 border-[#111111]" aria-labelledby="cta-heading">
                <div className="max-w-screen-xl mx-auto px-4 py-16 sm:py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-[#111111]">
                        <div className="lg:col-span-8 p-10 sm:p-16 border-b lg:border-b-0 lg:border-r border-[#111111]">
                            <span className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-[#CC0000] font-bold block mb-4">Final Edition</span>
                            <h2 id="cta-heading" className="font-serif-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#111111] leading-[0.95] tracking-tighter">
                                Ready to Experience Next-Generation Chemical Distribution?
                            </h2>
                            <p className="font-body-serif text-lg text-[#525252] leading-relaxed mt-6 max-w-lg">
                                Browse the latest news bulletins free of charge, or sign in to your distributor
                                portal to access your secure document hub and COA library.
                            </p>
                            <div className="mt-8 flex flex-col sm:flex-row gap-0 border border-[#111111] w-fit">
                                <Link
                                    href="/news"
                                    id="cta-read-news"
                                    className="flex items-center gap-2 px-6 py-4 bg-[#111111] text-[#F9F9F7] hover:bg-[#CC0000] transition-colors duration-200 font-sans text-xs font-bold uppercase tracking-widest border-b sm:border-b-0 sm:border-r border-[#F9F9F7]/20"
                                >
                                    Read Latest News
                                </Link>
                                <Link
                                    href={session ? '/dashboard' : '/login'}
                                    id="cta-portal"
                                    className="flex items-center gap-2 px-6 py-4 bg-[#F9F9F7] text-[#111111] hover:bg-[#E5E5E0] transition-colors duration-200 font-sans text-xs font-bold uppercase tracking-widest"
                                >
                                    {session ? 'Open Dashboard' : 'Distributor Login'}
                                </Link>
                            </div>
                        </div>
                        <div className="lg:col-span-4 p-10 bg-[#111111] flex flex-col justify-between gap-8">
                            <div>
                                <div className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-[#2E7D32] font-bold mb-4">Why Spentica</div>
                                {[
                                    'Open-access public news hub',
                                    'Encrypted COA & TDS transfers',
                                    'Real-time push notifications',
                                    'Verified distributor network',
                                    'ISO-compliant audit trails',
                                ].map((point, i) => (
                                    <div key={i} className="flex items-center gap-3 py-2 border-b border-[#F9F9F7]/10 last:border-b-0">
                                        <span className="w-2 h-2 bg-[#CC0000] flex-shrink-0" aria-hidden="true" />
                                        <span className="font-body-serif text-sm text-[#A3A3A3]">{point}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-[#525252]">
                                Spentica Chemicals · Est. 2024
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                FOOTER
            ══════════════════════════════════════════ */}
            <footer className="bg-[#111111] border-t-4 border-[#111111]" role="contentinfo">
                <div className="max-w-screen-xl mx-auto px-4">

                    {/* Main footer grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 border-b border-[#F9F9F7]/10 py-12 gap-8 lg:gap-0">

                        {/* Brand */}
                        <div className="lg:col-span-4 lg:border-r border-[#F9F9F7]/10 lg:pr-8 flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/spentica-logo.png" alt="Spentica Chemicals" className="w-9 h-9 object-contain brightness-0 invert" />
                                <span className="font-serif-display text-2xl font-black text-[#F9F9F7]">Spentica Chemicals</span>
                            </div>
                            <p className="font-body-serif text-sm text-[#A3A3A3] leading-relaxed">
                                The trusted B2B digital platform for chemical document exchange,
                                verified distributor relations, and global industry intelligence.
                            </p>
                            <div className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-[#525252]">
                                {edition}
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="lg:col-span-3 lg:px-8 lg:border-r border-[#F9F9F7]/10">
                            <h4 className="font-mono-data text-[10px] font-bold uppercase tracking-[0.25em] text-[#F9F9F7] mb-4">Navigation</h4>
                            <ul className="space-y-3">
                                {[
                                    { href: '#who-we-are', label: 'Who We Are' },
                                    { href: '/news', label: 'Industry News' },
                                    { href: '#capabilities', label: 'Platform Capabilities' },
                                    { href: '#faq', label: 'FAQ' },
                                ].map(({ href, label }) => (
                                    <li key={label}>
                                        <Link href={href} className="font-body-serif text-sm text-[#A3A3A3] hover:text-[#F9F9F7] transition-colors">
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Distributor Portal */}
                        <div className="lg:col-span-3 lg:px-8 lg:border-r border-[#F9F9F7]/10">
                            <h4 className="font-mono-data text-[10px] font-bold uppercase tracking-[0.25em] text-[#F9F9F7] mb-4">Distributor Portal</h4>
                            <ul className="space-y-3">
                                {[
                                    { href: '/login', label: 'Partner Login' },
                                    { href: '/news?category=Regulatory', label: 'Regulatory Bulletins' },
                                    { href: '/news?category=Product+Launch', label: 'Product Launches' },
                                    { href: '/news?category=Industry+Update', label: 'Industry Updates' },
                                ].map(({ href, label }) => (
                                    <li key={label}>
                                        <Link href={href} className="font-body-serif text-sm text-[#A3A3A3] hover:text-[#F9F9F7] transition-colors">
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact / Info */}
                        <div className="lg:col-span-2 lg:pl-8">
                            <h4 className="font-mono-data text-[10px] font-bold uppercase tracking-[0.25em] text-[#F9F9F7] mb-4">Platform</h4>
                            <ul className="space-y-3">
                                <li className="font-body-serif text-sm text-[#A3A3A3]">Chemical Supply Chain</li>
                                <li className="font-body-serif text-sm text-[#A3A3A3]">Compliance Intelligence</li>
                                <li className="font-body-serif text-sm text-[#A3A3A3]">Document Exchange</li>
                                <li>
                                    <span className="inline-block font-mono-data text-[10px] uppercase tracking-widest text-[#CC0000] border border-[#CC0000] px-2 py-1 sharp-corners">
                                        Enterprise Network
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Footer bottom */}
                    <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="font-mono-data text-[11px] uppercase tracking-widest text-[#525252]">
                            © {new Date().getFullYear()} Spentica Chemicals. All rights reserved.
                        </p>
                        <p className="font-mono-data text-[11px] uppercase tracking-widest text-[#525252]">
                            Printed in Digital Ink · Vol. I
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

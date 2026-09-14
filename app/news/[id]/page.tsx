'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Calendar,
    Clock,
    ExternalLink,
    Share2,
    Newspaper,
    RefreshCw,
    AlertCircle,
    Check,
    ArrowRight,
    BookOpen,
} from 'lucide-react';

interface NewsItem {
    id: string;
    title: string;
    content: string;
    category: string;
    imageUrl: string | null;
    source: string | null;
    publishDate: string;
    createdAt: string;
    author?: { fullName: string } | null;
}

// ── Helpers ──────────────────────────────────────────────
function getCategoryLabel(category: string): string {
    const map: Record<string, string> = {
        'Industry Update': 'Industry',
        'Product Launch': 'Launch',
        'Regulatory': 'Regulatory',
        'Company News': 'Company',
        'General Announcement': 'Announcement',
    };
    return map[category] ?? category;
}

function getCategoryAccent(category: string): string {
    const map: Record<string, string> = {
        'Industry Update': '#0D9488',   // teal
        'Product Launch': '#7C3AED',    // purple
        'Regulatory': '#DC2626',        // red
        'Company News': '#059669',      // green
        'General Announcement': '#2563EB', // blue
    };
    return map[category] ?? '#111111';
}

function getReadingTime(content: string): number {
    return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

function formatDate(dateStr: string, long = true): string {
    return new Date(dateStr).toLocaleDateString('en-US', long
        ? { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
        : { month: 'short', day: 'numeric', year: 'numeric' }
    );
}

// ── Related Article Card ──────────────────────────────────
function RelatedCard({ article }: { article: NewsItem }) {
    const accent = getCategoryAccent(article.category);
    return (
        <Link href={`/news/${article.id}`} className="group block">
            <div className="flex gap-0 border border-[#E5E5E0] hover:border-[#111111] transition-colors duration-200 overflow-hidden bg-white hard-shadow-hover">
                {/* Accent bar */}
                <div className="w-1 flex-shrink-0" style={{ backgroundColor: accent }} />
                {/* Thumb */}
                {article.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-16 h-16 object-cover flex-shrink-0 np-img-grayscale border-r border-[#E5E5E0]"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                )}
                <div className="p-3 min-w-0">
                    <p className="font-mono-data text-[9px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: accent }}>
                        {getCategoryLabel(article.category)}
                    </p>
                    <p className="font-serif-display text-sm font-bold text-[#111111] group-hover:text-[#2E7D32] transition-colors line-clamp-2 leading-snug">
                        {article.title}
                    </p>
                    <p className="font-mono-data text-[9px] text-[#737373] mt-1.5">
                        {formatDate(article.publishDate, false)}
                    </p>
                </div>
            </div>
        </Link>
    );
}

// ── Main Component ────────────────────────────────────────
export default function ArticleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [article, setArticle] = useState<NewsItem | null>(null);
    const [related, setRelated] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [readProgress, setReadProgress] = useState(0);

    // Reading progress bar
    useEffect(() => {
        const handleScroll = () => {
            const article = document.getElementById('article-body');
            if (!article) return;
            const rect = article.getBoundingClientRect();
            const articleHeight = article.offsetHeight;
            const scrolled = Math.max(0, -rect.top);
            const progress = Math.min(100, (scrolled / (articleHeight - window.innerHeight + 200)) * 100);
            setReadProgress(isNaN(progress) ? 0 : progress);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!id) return;
        const fetchArticle = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch(`/api/news/${id}`);
                if (!response.ok) {
                    if (response.status === 404) throw new Error('not_found');
                    throw new Error('fetch_failed');
                }
                const data = await response.json();
                const art: NewsItem = data.data;
                setArticle(art);

                const relatedRes = await fetch(`/api/news?limit=4&category=${encodeURIComponent(art.category)}`);
                if (relatedRes.ok) {
                    const relData = await relatedRes.json();
                    setRelated((relData.data || []).filter((r: NewsItem) => r.id !== art.id).slice(0, 3));
                }
            } catch (err: unknown) {
                setError(err instanceof Error && err.message === 'not_found' ? 'not_found' : 'fetch_failed');
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [id]);

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch { /* fallback */ }
    };

    // ── Loading skeleton ─────────────────────────────────
    if (loading) {
        return (
            <div className="max-w-screen-xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
                    <div className="animate-pulse space-y-5">
                        <div className="h-3 bg-[#E5E5E0] w-1/4" />
                        <div className="h-12 bg-[#E5E5E0] w-full" />
                        <div className="h-12 bg-[#E5E5E0] w-4/5" />
                        <div className="h-72 bg-[#E5E5E0]" />
                        <div className="space-y-3 mt-6">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="h-4 bg-[#E5E5E0] rounded-none" style={{ width: i % 3 === 2 ? '75%' : '100%' }} />
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4 animate-pulse hidden lg:block">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-[#E5E5E0]" />)}
                    </div>
                </div>
            </div>
        );
    }

    // ── Error states ─────────────────────────────────────
    if (error === 'not_found') {
        return (
            <div className="max-w-2xl mx-auto px-4 py-28 text-center">
                <Newspaper className="w-14 h-14 text-[#E5E5E0] mx-auto mb-6" strokeWidth={1} />
                <h1 className="font-serif-display font-black text-5xl text-[#111111] mb-4">Article Not Found</h1>
                <p className="font-body-serif text-base text-[#737373] mb-8">
                    This article may have been removed or the link is incorrect.
                </p>
                <Link href="/news" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#111111] hover:bg-[#111111] hover:text-[#F9F9F7] transition-colors font-sans text-xs font-bold uppercase tracking-widest sharp-corners">
                    <ArrowLeft className="w-4 h-4" /> Back to News
                </Link>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-24 text-center">
                <AlertCircle className="w-12 h-12 text-[#CC0000] mx-auto mb-4" strokeWidth={1.5} />
                <h2 className="font-serif-display font-bold text-2xl text-[#111111] mb-3">Failed to load article</h2>
                <p className="font-body-serif text-sm text-[#737373] mb-6">An error occurred. Please try again.</p>
                <button onClick={() => router.refresh()} className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-[#111111] hover:bg-[#111111] hover:text-[#F9F9F7] transition-colors font-sans text-xs font-bold uppercase tracking-widest sharp-corners">
                    <RefreshCw className="w-4 h-4" /> Try again
                </button>
            </div>
        );
    }

    if (!article) return null;

    const readingTime = getReadingTime(article.content);
    const paragraphs = article.content.split('\n').map(p => p.trim()).filter(Boolean);
    const accent = getCategoryAccent(article.category);

    // ── Article Layout ───────────────────────────────────
    return (
        <>
            {/* ── Reading progress bar ── */}
            <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-[#E5E5E0]">
                <div
                    className="h-full transition-all duration-150 ease-out"
                    style={{ width: `${readProgress}%`, backgroundColor: accent }}
                />
            </div>

            <div className="max-w-screen-xl mx-auto px-4">

                {/* ── Breadcrumb strip ── */}
                <div className="border-b border-[#E5E5E0] py-3 flex items-center gap-2 font-mono-data text-[10px] uppercase tracking-widest text-[#737373]">
                    <Link href="/" className="hover:text-[#2E7D32] transition-colors">Home</Link>
                    <span>›</span>
                    <Link href="/news" className="hover:text-[#2E7D32] transition-colors">News</Link>
                    <span>›</span>
                    <span className="text-[#111111] truncate max-w-xs">{article.title}</span>
                </div>

                {/* ── Hero band (category color accent) ── */}
                <div className="w-full h-1" style={{ backgroundColor: accent }} />

                {/* ── Article header (full-width masthead area) ── */}
                <div className="newsprint-texture border-b-2 border-[#111111] py-10">
                    {/* Category + meta */}
                    <div className="flex flex-wrap items-center gap-4 mb-5">
                        <span
                            className="font-mono-data text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1 sharp-corners border text-white"
                            style={{ backgroundColor: accent, borderColor: accent }}
                        >
                            {getCategoryLabel(article.category)}
                        </span>
                        <span className="flex items-center gap-1.5 font-mono-data text-[10px] text-[#737373]">
                            <Calendar className="w-3 h-3" />{formatDate(article.publishDate)}
                        </span>
                        <span className="flex items-center gap-1.5 font-mono-data text-[10px] text-[#737373]">
                            <Clock className="w-3 h-3" />{readingTime} min read
                        </span>
                        {article.author && (
                            <span className="font-mono-data text-[10px] text-[#737373] uppercase tracking-widest">
                                By <span className="text-[#111111] font-bold">{article.author.fullName}</span>
                            </span>
                        )}
                    </div>

                    {/* Big editorial headline */}
                    <h1
                        className="font-serif-display font-black text-[#111111] leading-[0.93] tracking-tight"
                        style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}
                    >
                        {article.title}
                    </h1>

                    {/* Excerpt / first paragraph preview */}
                    {paragraphs.length > 0 && (
                        <p className="font-body-serif text-lg text-[#525252] mt-5 max-w-3xl leading-relaxed border-l-4 pl-4" style={{ borderColor: accent }}>
                            {paragraphs[0].length > 220 ? paragraphs[0].substring(0, 217) + '…' : paragraphs[0]}
                        </p>
                    )}
                </div>

                {/* ── Two-column layout ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-0 lg:gap-10 py-10" id="article-body">

                    {/* ── MAIN ARTICLE ── */}
                    <article>

                        {/* Hero image */}
                        {article.imageUrl && !imageError ? (
                            <div className="mb-8 overflow-hidden border border-[#111111] group">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={article.imageUrl}
                                    alt={article.title}
                                    className="w-full object-cover max-h-[520px] group-hover:scale-[1.01] transition-transform duration-500"
                                    onError={() => setImageError(true)}
                                />
                                <div className="flex items-center justify-between px-3 py-2 border-t border-[#E5E5E0] bg-[#F5F5F5]">
                                    <p className="font-mono-data text-[10px] uppercase tracking-widest text-[#737373]">
                                        Fig. 1.1 — {getCategoryLabel(article.category)} · {formatDate(article.publishDate, false)}
                                    </p>
                                    <span className="font-mono-data text-[10px] uppercase tracking-widest text-[#737373]">
                                        Spentica Chemicals
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-8 h-56 border border-[#E5E5E0] relative overflow-hidden bg-[#F9F9F7] flex items-center justify-center">
                                <div className="np-halftone absolute inset-0" aria-hidden="true" />
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/spentica-logo.png" alt="" className="w-16 h-16 object-contain opacity-10 relative z-10" />
                            </div>
                        )}

                        {/* ── Article Body ── */}
                        <div className="space-y-0">
                            {paragraphs.map((paragraph, i) => (
                                <p
                                    key={i}
                                    className={`font-body-serif text-[1.0625rem] sm:text-[1.125rem] text-[#1a1a1a] leading-[1.85] mb-5 text-justify
                                        ${i === 0 ? 'np-dropcap' : ''}
                                    `}
                                >
                                    {paragraph}
                                </p>
                            ))}
                        </div>

                        {/* ── Pull quote (if multiple paragraphs) ── */}
                        {paragraphs.length >= 4 && (
                            <blockquote
                                className="my-8 pl-5 border-l-4 py-2"
                                style={{ borderColor: accent }}
                            >
                                <p className="font-serif-display text-xl sm:text-2xl font-bold text-[#111111] leading-snug italic">
                                    &ldquo;{paragraphs[Math.floor(paragraphs.length / 2)].substring(0, 160).trimEnd()}&hellip;&rdquo;
                                </p>
                            </blockquote>
                        )}

                        {/* ── Source ── */}
                        {article.source && (
                            <div className="mt-8 pt-5 border-t border-[#E5E5E0] flex items-center gap-2">
                                <span className="font-mono-data text-[10px] uppercase tracking-widest text-[#737373]">Source:</span>
                                <a
                                    href={article.source.startsWith('http') ? article.source : `https://${article.source}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 font-mono-data text-[10px] hover:underline underline-offset-2"
                                    style={{ color: accent }}
                                >
                                    {article.source}
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        )}

                        {/* ── Actions row ── */}
                        <div className="mt-6 pt-5 border-t border-[#111111] flex flex-wrap gap-3">
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-4 py-2.5 border border-[#111111] bg-transparent hover:bg-[#111111] hover:text-[#F9F9F7] transition-colors duration-200 font-sans text-xs font-bold uppercase tracking-widest sharp-corners"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" strokeWidth={1.5} />}
                                {copied ? 'Link Copied!' : 'Share Article'}
                            </button>
                            <Link
                                href="/news"
                                className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E5E0] bg-transparent hover:border-[#111111] transition-colors duration-200 font-sans text-xs font-bold uppercase tracking-widest sharp-corners text-[#737373] hover:text-[#111111]"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                All News
                            </Link>
                        </div>

                        {/* ── Distributor CTA ── */}
                        <div className="mt-10 border-l-4 bg-[#111111] p-6 sm:p-8" style={{ borderColor: accent }}>
                            <div className="flex items-start gap-4">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/spentica-logo.png" alt="Spentica" className="w-10 h-10 object-contain brightness-0 invert flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-serif-display font-bold text-xl text-[#F9F9F7] mb-1">
                                        Are you a distributor?
                                    </p>
                                    <p className="font-body-serif text-sm text-[#A3A3A3] mb-5 leading-relaxed">
                                        Log in to access Certificates of Analysis, shared documents, and personalized notifications from Spentica Chemicals.
                                    </p>
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 text-[#111111] bg-[#F9F9F7] hover:bg-white transition-colors font-sans text-xs font-bold uppercase tracking-widest sharp-corners"
                                    >
                                        Access Distributor Portal
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* ── SIDEBAR ── */}
                    <aside className="mt-10 lg:mt-0">
                        <div className="sticky top-24 space-y-6">

                            {/* Article meta card */}
                            <div className="border border-[#111111] overflow-hidden">
                                <div className="px-4 py-3 font-mono-data text-[10px] font-bold uppercase tracking-[0.2em] text-[#F9F9F7] flex items-center gap-2" style={{ backgroundColor: accent }}>
                                    <BookOpen className="w-3.5 h-3.5" />
                                    Article Details
                                </div>
                                <div className="p-4 bg-[#F9F9F7] space-y-3">
                                    <div className="border-b border-[#E5E5E0] pb-3">
                                        <dt className="font-mono-data text-[9px] uppercase tracking-widest text-[#737373]">Category</dt>
                                        <dd className="font-sans text-sm font-bold text-[#111111] mt-0.5">{article.category}</dd>
                                    </div>
                                    <div className="border-b border-[#E5E5E0] pb-3">
                                        <dt className="font-mono-data text-[9px] uppercase tracking-widest text-[#737373]">Published</dt>
                                        <dd className="font-sans text-sm font-bold text-[#111111] mt-0.5">{formatDate(article.publishDate)}</dd>
                                    </div>
                                    <div className="border-b border-[#E5E5E0] pb-3">
                                        <dt className="font-mono-data text-[9px] uppercase tracking-widest text-[#737373]">Reading Time</dt>
                                        <dd className="font-sans text-sm font-bold text-[#111111] mt-0.5">{readingTime} minute{readingTime !== 1 ? 's' : ''}</dd>
                                    </div>
                                    {article.author && (
                                        <div>
                                            <dt className="font-mono-data text-[9px] uppercase tracking-widest text-[#737373]">Author</dt>
                                            <dd className="font-sans text-sm font-bold text-[#111111] mt-0.5">{article.author.fullName}</dd>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Reading progress card */}
                            <div className="border border-[#E5E5E0] p-4 bg-[#F9F9F7]">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-mono-data text-[9px] uppercase tracking-widest text-[#737373]">Reading Progress</span>
                                    <span className="font-mono-data text-[9px] text-[#111111] font-bold">{Math.round(readProgress)}%</span>
                                </div>
                                <div className="w-full bg-[#E5E5E0] h-1.5 sharp-corners overflow-hidden">
                                    <div
                                        className="h-full transition-all duration-300"
                                        style={{ width: `${readProgress}%`, backgroundColor: accent }}
                                    />
                                </div>
                                <p className="font-mono-data text-[9px] text-[#737373] mt-2">
                                    ~{Math.max(0, Math.ceil(readingTime - (readingTime * readProgress / 100)))} min remaining
                                </p>
                            </div>

                            {/* Related articles */}
                            {related.length > 0 && (
                                <div>
                                    <h3 className="font-mono-data text-[10px] font-bold uppercase tracking-[0.25em] text-[#111111] mb-3 border-b-2 border-[#111111] pb-2">
                                        Related Articles
                                    </h3>
                                    <div className="space-y-3">
                                        {related.map((rel) => (
                                            <RelatedCard key={rel.id} article={rel} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Browse all */}
                            <Link
                                href="/news"
                                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#111111] bg-transparent hover:bg-[#111111] hover:text-[#F9F9F7] transition-colors duration-200 font-sans text-[11px] font-bold uppercase tracking-widest sharp-corners"
                            >
                                <Newspaper className="w-4 h-4" strokeWidth={1.5} />
                                Browse All Articles
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}

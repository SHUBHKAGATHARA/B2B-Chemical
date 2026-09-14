'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Calendar,
    Clock,
    Newspaper,
    ArrowRight,
    RefreshCw,
    AlertCircle,
    FlaskConical,
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
const CATEGORIES = [
    { key: 'All', label: 'All News' },
    { key: 'General Announcement', label: 'Announcements' },
    { key: 'Industry Update', label: 'Industry Update' },
    { key: 'Product Launch', label: 'Product Launch' },
    { key: 'Company News', label: 'Company News' },
    { key: 'Regulatory', label: 'Regulatory' },
];

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

function getReadingTime(content: string): number {
    return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

function getExcerpt(content: string, maxChars = 160): string {
    if (content.length <= maxChars) return content;
    return content.substring(0, maxChars).trimEnd() + '…';
}

// ── Image with grayscale newsprint treatment ─────────────
function NewsImage({
    src,
    alt,
    className = '',
}: {
    src: string | null;
    alt: string;
    className?: string;
}) {
    const [error, setError] = useState(false);

    if (!src || error) {
        return (
            <div className={`${className} bg-[#F5F5F5] flex items-center justify-center relative overflow-hidden`}>
                <div className="np-halftone absolute inset-0" aria-hidden="true" />
                <FlaskConical className="w-10 h-10 text-[#111111] opacity-10 relative z-10" strokeWidth={1} />
            </div>
        );
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt}
            className={`${className} object-cover np-img-grayscale`}
            onError={() => setError(true)}
            loading="lazy"
        />
    );
}

// ── Loading skeleton (Newsprint style) ───────────────────
function NewsCardSkeleton() {
    return (
        <div className="border border-[#E5E5E0] animate-pulse">
            <div className="h-44 bg-[#E5E5E0]" />
            <div className="p-6 space-y-3">
                <div className="h-3 bg-[#E5E5E0] w-1/4" />
                <div className="h-5 bg-[#E5E5E0] w-4/5" />
                <div className="h-5 bg-[#E5E5E0] w-3/4" />
                <div className="h-3 bg-[#E5E5E0] w-full" />
                <div className="h-3 bg-[#E5E5E0] w-2/3" />
            </div>
        </div>
    );
}

// ── Featured Article ─────────────────────────────────────
function FeaturedArticle({ article }: { article: NewsItem }) {
    const readingTime = getReadingTime(article.content);
    return (
        <Link href={`/news/${article.id}`} className="group block">
            <div className="grid md:grid-cols-2 border border-[#111111] hard-shadow-hover">
                {/* Image */}
                <div className="relative h-64 md:h-auto min-h-[300px] overflow-hidden border-b md:border-b-0 md:border-r border-[#111111]">
                    <NewsImage
                        src={article.imageUrl}
                        alt={article.title}
                        className="absolute inset-0 w-full h-full"
                    />
                    {/* Featured stamp */}
                    <div className="absolute top-0 left-0 bg-[#CC0000] text-white font-mono-data text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5">
                        ★ Featured
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 lg:p-10 flex flex-col justify-between bg-[#F9F9F7]">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="font-mono-data text-[10px] font-bold uppercase tracking-[0.2em] text-[#CC0000] border border-[#CC0000] px-1.5 py-0.5 sharp-corners">
                                {getCategoryLabel(article.category)}
                            </span>
                            <span className="font-mono-data text-[10px] text-[#737373] flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {readingTime} min read
                            </span>
                        </div>

                        <h2 className="font-serif-display font-black text-2xl lg:text-3xl text-[#111111] leading-tight mb-4 group-hover:text-[#CC0000] transition-colors duration-200">
                            {article.title}
                        </h2>

                        <p className="font-body-serif text-sm text-[#525252] leading-relaxed line-clamp-4 text-justify mb-6">
                            {getExcerpt(article.content, 300)}
                        </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#E5E5E0] pt-5">
                        <div className="flex items-center gap-1.5 font-mono-data text-[10px] text-[#737373]">
                            <Calendar className="w-3 h-3" />
                            {new Date(article.publishDate).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'long', day: 'numeric',
                            })}
                        </div>
                        <span className="inline-flex items-center gap-1.5 font-sans text-[11px] font-bold uppercase tracking-widest text-[#111111] group-hover:text-[#CC0000] transition-colors">
                            Read Article
                            <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ── News Card ────────────────────────────────────────────
function NewsCard({ article, index }: { article: NewsItem; index: number }) {
    return (
        <Link href={`/news/${article.id}`} className="group block h-full">
            <article
                className={`h-full flex flex-col border border-[#111111] hard-shadow-hover bg-[#F9F9F7]
                    ${index % 2 === 0 ? '' : ''}
                `}
            >
                {/* Image */}
                <div className="relative h-44 overflow-hidden border-b border-[#111111]">
                    <NewsImage
                        src={article.imageUrl}
                        alt={article.title}
                        className="absolute inset-0 w-full h-full group-hover:scale-[1.02] transition-transform duration-300"
                    />
                    <div className="absolute top-0 left-0 bg-[#111111] px-2 py-1">
                        <span className="font-mono-data text-[10px] font-bold uppercase tracking-[0.15em] text-[#CC0000]">
                            {getCategoryLabel(article.category)}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1 gap-3">
                    <h3 className="font-serif-display font-bold text-lg text-[#111111] leading-snug group-hover:text-[#CC0000] transition-colors duration-200 line-clamp-2">
                        {article.title}
                    </h3>

                    <p className="font-body-serif text-sm text-[#525252] leading-relaxed line-clamp-3 flex-1 text-justify">
                        {getExcerpt(article.content, 160)}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-[#E5E5E0]">
                        <div className="flex items-center gap-3 font-mono-data text-[10px] text-[#737373]">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(article.publishDate).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric',
                                })}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {getReadingTime(article.content)}m
                            </span>
                        </div>
                        <span className="inline-flex items-center gap-1 font-sans text-[10px] font-bold uppercase tracking-widest text-[#111111] group-hover:text-[#CC0000] transition-colors">
                            Read More
                            <ArrowRight className="w-3 h-3" />
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}

// ── Main Page ────────────────────────────────────────────
function NewsPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get('category') || 'All';

    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [total, setTotal] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);
    const limit = 9;

    const fetchNews = useCallback(async (cat: string, reset = true) => {
        if (reset) {
            setLoading(true);
            setError('');
        } else {
            setLoadingMore(true);
        }

        try {
            const params = new URLSearchParams({
                limit: String(limit),
                offset: reset ? '0' : String(news.length),
            });
            if (cat !== 'All') params.set('category', cat);

            const response = await fetch(`/api/news?${params}`);
            if (!response.ok) throw new Error('Failed to load news');

            const data = await response.json();
            const items: NewsItem[] = data.data || [];

            if (reset) {
                setNews(items);
            } else {
                setNews((prev) => [...prev, ...items]);
            }
            setTotal(data.pagination?.total || 0);
        } catch {
            setError('Unable to load news. Please try again.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [news.length]);

    useEffect(() => {
        fetchNews(activeCategory, true);
    }, [activeCategory]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleCategoryChange = (cat: string) => {
        setActiveCategory(cat);
        if (cat === 'All') {
            router.push('/news', { scroll: false });
        } else {
            router.push(`/news?category=${encodeURIComponent(cat)}`, { scroll: false });
        }
    };

    const featured = news[0] || null;
    const rest = news.slice(1);
    const hasMore = news.length < total;

    return (
        <>
            {/* ── Hero / Masthead ── */}
            <section className="newsprint-texture border-b-4 border-[#111111]">
                <div className="max-w-screen-xl mx-auto px-4">
                    {/* Top rule */}
                    <div className="py-3 border-b border-[#111111] flex items-center gap-3">
                        <span className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-[#CC0000] font-bold">§ News Hub</span>
                        <span className="flex-1 border-t border-dashed border-[#E5E5E0]" />
                        <span className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-[#737373]">● Live Coverage</span>
                    </div>

                    {/* Masthead */}
                    <div className="py-10 text-center border-b border-[#111111]">
                        <h1 className="font-serif-display font-black leading-[0.9] tracking-tighter text-[#111111]"
                            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
                            Chemical Industry News
                        </h1>
                        <p className="font-body-serif text-base text-[#525252] mt-4 max-w-xl mx-auto leading-relaxed">
                            Company updates, regulatory developments, product announcements, and market insights —
                            curated for chemical sector professionals.
                        </p>
                    </div>

                    {/* Category filter bar */}
                    <div className="flex items-center border-b border-[#111111] overflow-x-auto scrollbar-none">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.key}
                                onClick={() => handleCategoryChange(cat.key)}
                                className={`px-4 py-3 font-sans text-[11px] font-bold uppercase tracking-widest border-r border-[#111111] flex-shrink-0 transition-colors duration-200 min-h-[44px]
                                    ${activeCategory === cat.key
                                        ? 'bg-[#111111] text-[#F9F9F7]'
                                        : 'bg-transparent text-[#111111] hover:bg-[#F0F0F0]'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                        <span className="flex-1 min-w-0" />
                        {total > 0 && (
                            <span className="font-mono-data text-[10px] text-[#737373] px-4 py-3 flex-shrink-0">
                                {total} {total === 1 ? 'article' : 'articles'}
                            </span>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Content ── */}
            <section className="max-w-screen-xl mx-auto px-4 py-0">

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-3 p-4 border border-[#CC0000] text-[#CC0000] mt-8">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                        <p className="font-body-serif text-sm">{error}</p>
                        <button
                            onClick={() => fetchNews(activeCategory, true)}
                            className="ml-auto flex items-center gap-1.5 font-sans text-xs font-bold uppercase tracking-widest hover:underline"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Retry
                        </button>
                    </div>
                )}

                {/* Loading skeletons */}
                {loading && !error && (
                    <div className="pt-8">
                        <div className="mb-8 border border-[#E5E5E0] animate-pulse">
                            <div className="grid md:grid-cols-2">
                                <div className="h-64 bg-[#E5E5E0]" />
                                <div className="p-10 space-y-4">
                                    <div className="h-3 bg-[#E5E5E0] w-1/4" />
                                    <div className="h-8 bg-[#E5E5E0] w-4/5" />
                                    <div className="h-8 bg-[#E5E5E0] w-3/4" />
                                    <div className="space-y-2 mt-4">
                                        <div className="h-3 bg-[#E5E5E0] w-full" />
                                        <div className="h-3 bg-[#E5E5E0] w-full" />
                                        <div className="h-3 bg-[#E5E5E0] w-2/3" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => <NewsCardSkeleton key={i} />)}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && news.length === 0 && (
                    <div className="text-center py-24 border-b border-[#E5E5E0]">
                        <Newspaper className="w-12 h-12 text-[#E5E5E0] mx-auto mb-4" strokeWidth={1} />
                        <h3 className="font-serif-display font-bold text-xl text-[#111111] mb-2">No articles yet</h3>
                        <p className="font-body-serif text-sm text-[#737373] max-w-sm mx-auto">
                            {activeCategory !== 'All'
                                ? `No articles in the "${activeCategory}" category yet. Check back soon.`
                                : 'No news articles have been published yet. Check back soon.'}
                        </p>
                        {activeCategory !== 'All' && (
                            <button
                                onClick={() => handleCategoryChange('All')}
                                className="mt-6 px-5 py-2.5 border-2 border-[#111111] bg-transparent hover:bg-[#111111] hover:text-[#F9F9F7] transition-colors duration-200 font-sans text-xs font-bold uppercase tracking-widest sharp-corners"
                            >
                                View all news
                            </button>
                        )}
                    </div>
                )}

                {/* Content: Featured + Grid */}
                {!loading && !error && news.length > 0 && (
                    <>
                        {/* Featured article */}
                        {featured && (
                            <div className="pt-8 pb-8 border-b border-[#111111]">
                                <div className="flex items-center gap-3 mb-5">
                                    <span className="font-mono-data text-[10px] text-[#CC0000] font-bold uppercase tracking-[0.2em]">
                                        ◆ Top Story
                                    </span>
                                    <span className="flex-1 border-t border-dashed border-[#E5E5E0]" />
                                </div>
                                <FeaturedArticle article={featured} />
                            </div>
                        )}

                        {/* Grid of remaining articles */}
                        {rest.length > 0 && (
                            <div className="pt-8 pb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="font-serif-display font-black text-xl text-[#111111]">More Stories</span>
                                    <span className="flex-1 border-t border-[#E5E5E0]" />
                                    <span className="font-mono-data text-[10px] text-[#737373]">{total} total</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {rest.map((item, i) => (
                                        <NewsCard key={item.id} article={item} index={i} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Load more */}
                        {hasMore && (
                            <div className="text-center pb-10 border-t border-[#E5E5E0] pt-8">
                                <button
                                    onClick={() => fetchNews(activeCategory, false)}
                                    disabled={loadingMore}
                                    className="px-8 py-3 border-2 border-[#111111] bg-transparent hover:bg-[#111111] hover:text-[#F9F9F7] transition-all duration-200 font-sans text-xs font-bold uppercase tracking-widest sharp-corners inline-flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loadingMore && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                    Load more articles
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* ── Platform Info Strip ── */}
            {!loading && (
                <section className="border-t-4 border-[#111111] bg-[#111111]">
                    <div className="max-w-screen-xl mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-3">
                            {[
                                {
                                    num: '01',
                                    title: 'Secure Documents',
                                    desc: 'Safety data sheets, product specs, and compliance documents — shared securely with authorized partners.',
                                },
                                {
                                    num: '02',
                                    title: 'Real-Time Notifications',
                                    desc: 'Instant alerts when new documents or important updates are shared with your company.',
                                },
                                {
                                    num: '03',
                                    title: 'Industry Intelligence',
                                    desc: 'Stay current with regulatory changes, market trends, and company announcements.',
                                },
                            ].map(({ num, title, desc }, i) => (
                                <div
                                    key={i}
                                    className={`p-8 border-b md:border-b-0 border-[#F9F9F7]/10 ${i < 2 ? 'md:border-r md:border-[#F9F9F7]/10' : ''}`}
                                >
                                    <div className="font-mono-data text-3xl font-bold text-[#CC0000] leading-none mb-3">{num}</div>
                                    <h3 className="font-serif-display font-bold text-lg text-[#F9F9F7] mb-2">{title}</h3>
                                    <p className="font-body-serif text-sm text-[#A3A3A3] leading-relaxed">{desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="py-6 border-t border-[#F9F9F7]/10 text-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 px-6 py-3 border border-[#F9F9F7]/20 text-[#F9F9F7] hover:bg-[#F9F9F7] hover:text-[#111111] transition-colors duration-200 font-sans text-xs font-bold uppercase tracking-widest sharp-corners"
                            >
                                Access Distributor Portal
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}

// Wrap in Suspense for useSearchParams
export default function NewsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="font-serif-display text-6xl font-black text-[#E5E5E0] mb-4">…</div>
                    <p className="font-mono-data text-xs uppercase tracking-widest text-[#737373]">Loading Dispatches</p>
                </div>
            </div>
        }>
            <NewsPageInner />
        </Suspense>
    );
}

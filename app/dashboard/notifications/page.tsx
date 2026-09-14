'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, FileText, Newspaper, Check, CheckCheck, Filter, ChevronRight, Loader2, RefreshCw, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface NotificationItem {
    id: string;
    type: 'PDF' | 'NEWS' | 'SYSTEM';
    title: string;
    message: string;
    readFlag: boolean;
    createdAt: string;
    pdfId: string | null;
    newsId: string | null;
    pdf: {
        id: string;
        fileName: string;
        createdAt: string;
        uploadedByName: string;
        categoryName?: string | null;
    } | null;
    news: {
        id: string;
        title: string;
        category: string;
        imageUrl: string | null;
        publishDate: string;
    } | null;
}

type FilterType = 'ALL' | 'PDF' | 'NEWS' | 'UNREAD';

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);
    const [filter, setFilter] = useState<FilterType>('ALL');
    const [total, setTotal] = useState(0);
    const [offset, setOffset] = useState(0);
    const limit = 20;

    const buildParams = useCallback((currentOffset: number, currentFilter: FilterType) => {
        const params: Record<string, string> = {
            limit: String(limit),
            offset: String(currentOffset),
        };
        if (currentFilter === 'PDF') params.type = 'PDF';
        if (currentFilter === 'NEWS') params.type = 'NEWS';
        if (currentFilter === 'UNREAD') params.readFlag = 'false';
        return new URLSearchParams(params).toString();
    }, []);

    const fetchNotifications = useCallback(async (reset = true) => {
        const currentOffset = reset ? 0 : offset;
        if (reset) {
            setLoading(true);
            setOffset(0);
        } else {
            setLoadingMore(true);
        }

        try {
            const response = await fetch(
                `/api/notifications?${buildParams(currentOffset, filter)}`,
                { credentials: 'include' }
            );

            if (response.ok) {
                const data = await response.json();
                const newItems = data.data || [];

                if (reset) {
                    setNotifications(newItems);
                } else {
                    setNotifications((prev) => [...prev, ...newItems]);
                }

                setTotal(data.pagination?.total || 0);
                setUnreadCount(data.pagination?.unreadCount || 0);
                if (!reset) setOffset(currentOffset + limit);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [filter, offset, buildParams]);

    useEffect(() => {
        fetchNotifications(true);
    }, [filter]); // Re-fetch when filter changes

    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}`, {
                method: 'PATCH',
                credentials: 'include',
            });
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, readFlag: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        setMarkingAll(true);
        try {
            await fetch('/api/notifications/mark-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAll: true }),
                credentials: 'include',
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, readFlag: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        } finally {
            setMarkingAll(false);
        }
    };

    const handleClick = async (notif: NotificationItem) => {
        if (!notif.readFlag) await markAsRead(notif.id);
        if (notif.type === 'NEWS' && notif.newsId) {
            router.push(`/news/${notif.newsId}`);
        } else if (notif.type === 'PDF') {
            router.push('/dashboard/pdfs');
        }
    };

    const FILTERS: { key: FilterType; label: string }[] = [
        { key: 'ALL', label: 'All' },
        { key: 'UNREAD', label: 'Unread' },
        { key: 'PDF', label: 'Documents' },
        { key: 'NEWS', label: 'News' },
    ];

    const hasMore = notifications.length < total;

    return (
        <div className="min-h-screen bg-gray-50 py-0">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1 hover:text-teal-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 font-medium">Notifications</span>
            </div>

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl shadow-lg shadow-teal-200">
                            <Bell className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                            <p className="text-gray-500 text-sm mt-1">
                                {unreadCount > 0 ? (
                                    <span className="text-teal-600 font-semibold">{unreadCount} unread</span>
                                ) : (
                                    'All caught up!'
                                )}{' '}
                                · {total} total
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => fetchNotifications(true)}
                            className="p-2.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all border border-gray-200"
                            aria-label="Refresh"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                disabled={markingAll}
                                className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50"
                            >
                                {markingAll ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <CheckCheck className="w-4 h-4" />
                                )}
                                Mark all read
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {FILTERS.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                            filter === f.key
                                ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300 hover:text-teal-600'
                        }`}
                    >
                        {f.label}
                        {f.key === 'UNREAD' && unreadCount > 0 && (
                            <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full font-bold ${
                                filter === 'UNREAD'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-teal-100 text-teal-700'
                            }`}>
                                {unreadCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Notification List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex gap-4 animate-pulse">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0" />
                                <div className="flex-1 space-y-2.5">
                                    <div className="h-3.5 bg-gray-100 rounded w-1/3" />
                                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                                    <div className="h-3 bg-gray-100 rounded w-full" />
                                    <div className="h-2.5 bg-gray-100 rounded w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-base font-semibold text-gray-700">
                            {filter === 'UNREAD' ? 'No unread notifications' : 'No notifications yet'}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                            {filter === 'UNREAD'
                                ? 'You\'ve read everything!'
                                : 'Notifications will appear here when you receive documents or news updates.'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {notifications.map((notif) => (
                            <button
                                key={notif.id}
                                onClick={() => handleClick(notif)}
                                className={`w-full text-left px-6 py-5 hover:bg-gray-50 transition-all duration-150 group ${
                                    !notif.readFlag ? 'bg-teal-50/40' : ''
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform ${
                                            notif.type === 'NEWS'
                                                ? !notif.readFlag
                                                    ? 'bg-purple-100'
                                                    : 'bg-gray-100'
                                                : !notif.readFlag
                                                ? 'bg-teal-100'
                                                : 'bg-gray-100'
                                        }`}
                                    >
                                        {notif.type === 'NEWS' ? (
                                            <Newspaper
                                                className={`w-6 h-6 ${
                                                    !notif.readFlag ? 'text-purple-600' : 'text-gray-400'
                                                }`}
                                            />
                                        ) : (
                                            <FileText
                                                className={`w-6 h-6 ${
                                                    !notif.readFlag ? 'text-teal-600' : 'text-gray-400'
                                                }`}
                                            />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span
                                                className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                                                    notif.type === 'NEWS'
                                                        ? 'bg-purple-50 text-purple-600'
                                                        : 'bg-teal-50 text-teal-600'
                                                }`}
                                            >
                                                {notif.type === 'NEWS' ? 'News' : 'Document'}
                                            </span>
                                            {!notif.readFlag && (
                                                <span className="w-2 h-2 bg-teal-500 rounded-full" />
                                            )}
                                        </div>
                                        <p
                                            className={`text-sm font-semibold ${
                                                !notif.readFlag ? 'text-gray-900' : 'text-gray-600'
                                            }`}
                                        >
                                            {notif.title}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                            {notif.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                            {formatDistanceToNow(new Date(notif.createdAt), {
                                                addSuffix: true,
                                            })}
                                            <span className="text-gray-300">·</span>
                                            {format(new Date(notif.createdAt), 'MMM d, yyyy')}
                                        </p>
                                    </div>

                                    {/* Read indicator / check */}
                                    <div className="flex-shrink-0 mt-1">
                                        {notif.readFlag ? (
                                            <Check className="w-4 h-4 text-gray-300" />
                                        ) : (
                                            <div className="w-2.5 h-2.5 bg-teal-500 rounded-full" />
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}

                        {/* Load More */}
                        {hasMore && (
                            <div className="p-5 text-center">
                                <button
                                    onClick={() => {
                                        setOffset(notifications.length);
                                        fetchNotifications(false);
                                    }}
                                    disabled={loadingMore}
                                    className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:border-teal-300 hover:text-teal-600 font-semibold text-sm transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
                                >
                                    {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Load more
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

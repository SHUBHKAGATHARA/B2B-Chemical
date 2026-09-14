'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, X, FileText, Newspaper, Check, CheckCheck, ArrowRight, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

export default function NotificationsPanel() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);

    const fetchNotifications = useCallback(async (showLoading = false) => {
        try {
            if (showLoading) setLoading(true);
            const response = await fetch('/api/notifications?limit=10', {
                credentials: 'include',
            });

            if (response.ok && isMountedRef.current) {
                const data = await response.json();
                setNotifications(data.data || []);
                setUnreadCount(data.pagination?.unreadCount || 0);
            }
        } catch (error) {
            // Silently fail — panel should not crash
            console.error('Failed to fetch notifications:', error);
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    }, []);

    const markAsRead = async (notificationId: string) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}`, {
                method: 'PATCH',
                credentials: 'include',
            });

            if (response.ok && isMountedRef.current) {
                setNotifications((prev) =>
                    prev.map((n) => (n.id === notificationId ? { ...n, readFlag: true } : n))
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        setMarkingAll(true);
        try {
            const response = await fetch('/api/notifications/mark-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAll: true }),
                credentials: 'include',
            });

            if (response.ok && isMountedRef.current) {
                setNotifications((prev) => prev.map((n) => ({ ...n, readFlag: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        } finally {
            if (isMountedRef.current) setMarkingAll(false);
        }
    };

    const handleNotificationClick = async (notif: NotificationItem) => {
        // Mark as read first
        if (!notif.readFlag) {
            await markAsRead(notif.id);
        }
        setIsOpen(false);

        // Navigate to the correct destination
        if (notif.type === 'NEWS' && notif.newsId) {
            router.push(`/news/${notif.newsId}`);
        } else if (notif.type === 'PDF' && notif.pdfId) {
            router.push(`/dashboard/pdfs`);
        }
    };

    // Initial load + polling every 30 seconds
    useEffect(() => {
        isMountedRef.current = true;
        fetchNotifications(true);

        intervalRef.current = setInterval(() => {
            fetchNotifications(false);
        }, 30000);

        return () => {
            isMountedRef.current = false;
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchNotifications]);

    // Refetch when panel opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications(false);
        }
    }, [isOpen, fetchNotifications]);

    return (
        <div className="relative">
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                className="relative p-2.5 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all duration-200 group"
            >
                <Bell className="w-5 h-5" strokeWidth={2} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notifications Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-30"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Panel */}
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-40 max-h-[600px] flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-teal-50 to-cyan-50">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Notifications</h3>
                                {unreadCount > 0 && (
                                    <p className="text-xs text-teal-600 font-medium mt-0.5">
                                        {unreadCount} unread
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        disabled={markingAll}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-teal-700 bg-teal-100 hover:bg-teal-200 rounded-lg font-semibold transition-colors disabled:opacity-50"
                                    >
                                        {markingAll ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <CheckCheck className="w-3 h-3" />
                                        )}
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                    aria-label="Close notifications"
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="flex-1 overflow-y-auto scrollbar-thin">
                            {loading ? (
                                <div className="p-4 space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex gap-3 animate-pulse">
                                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 bg-gray-100 rounded w-3/4" />
                                                <div className="h-3 bg-gray-100 rounded w-full" />
                                                <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-10 text-center">
                                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                        <Bell className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-700">All caught up!</p>
                                    <p className="text-xs text-gray-400 mt-1">No notifications yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {notifications.map((notif) => (
                                        <button
                                            key={notif.id}
                                            onClick={() => handleNotificationClick(notif)}
                                            className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition-all duration-150 group ${
                                                !notif.readFlag ? 'bg-teal-50/60' : ''
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Icon */}
                                                <div
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
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
                                                            className={`w-5 h-5 ${
                                                                !notif.readFlag
                                                                    ? 'text-purple-600'
                                                                    : 'text-gray-500'
                                                            }`}
                                                        />
                                                    ) : (
                                                        <FileText
                                                            className={`w-5 h-5 ${
                                                                !notif.readFlag
                                                                    ? 'text-teal-600'
                                                                    : 'text-gray-500'
                                                            }`}
                                                        />
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-semibold truncate ${
                                                        !notif.readFlag ? 'text-gray-900' : 'text-gray-600'
                                                    }`}>
                                                        {notif.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1.5">
                                                        {formatDistanceToNow(new Date(notif.createdAt), {
                                                            addSuffix: true,
                                                        })}
                                                    </p>
                                                </div>

                                                {/* Unread dot */}
                                                {!notif.readFlag && (
                                                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    router.push('/dashboard/notifications');
                                }}
                                className="w-full flex items-center justify-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-semibold transition-colors group"
                            >
                                View all notifications
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, User, Search, Settings, ChevronDown } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface TopBarProps {
    user: {
        fullName?: string;
        email: string;
        role: string;
    };
}

export default function TopBar({ user }: TopBarProps) {
    const router = useRouter();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user.role === 'DISTRIBUTOR') {
            loadNotifications();
        }
    }, [user.role]);

    const loadNotifications = async () => {
        try {
            const data = await apiClient.getNotifications();
            setNotifications(data.data || []);
            setUnreadCount(data.pagination?.unreadCount || 0);
        } catch (error) {
            console.error('Failed to load notifications');
        }
    };

    const handleLogout = async () => {
        try {
            await apiClient.logout();
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout error');
        }
    };

    const handleNotificationClick = async (notif: any) => {
        try {
            if (!notif.readFlag) {
                await apiClient.markNotificationRead(notif.id);
                await loadNotifications();
            }
            setShowNotifications(false);
        } catch (error) {
            console.error('Failed to mark notification as read');
        }
    };

    return (
        <header className="h-16 bg-white/90 backdrop-blur-xl border-b border-green-200 px-6 flex items-center justify-between fixed top-0 right-0 left-64 z-20 shadow-lg">
            <div className="animate-slideUp">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                    Dashboard
                </h1>
                <p className="text-sm text-gray-600 mt-0.5">
                    Welcome back, <span className="font-semibold text-gray-900">{user.fullName || user.email}</span>
                </p>
            </div>

            <div className="flex items-center gap-3 animate-slideUp">
                {/* Search Bar */}
                <div className="relative hidden md:block">
                    <input
                        type="text"
                        placeholder="Quick search..."
                        className="w-64 pl-10 pr-4 py-2 text-sm border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-all placeholder:text-gray-400"
                    />
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                {/* Notifications (Distributor only) */}
                {user.role === 'DISTRIBUTOR' && (
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 group"
                        >
                            <Bell className="w-5 h-5 group-hover:animate-bounce-subtle" strokeWidth={2} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-green-200 max-h-[32rem] overflow-hidden z-40 animate-slideUp">
                                    <div className="p-4 border-b border-green-200 bg-gradient-to-r from-green-50 to-green-100">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-gray-900">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full font-semibold">{unreadCount} unread</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-12 text-center">
                                                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
                                                <p className="text-sm text-gray-600 font-medium">No notifications yet</p>
                                                <p className="text-xs text-gray-500 mt-1">We'll notify you when something arrives</p>
                                            </div>
                                        ) : (
                                            notifications.map((notif) => (
                                                <button
                                                    key={notif.id}
                                                    onClick={() => handleNotificationClick(notif)}
                                                    className="w-full text-left p-4 hover:bg-green-50 transition-all duration-200 group"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={cn(
                                                            'w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0 shadow-sm',
                                                            notif.readFlag ? 'bg-gray-300' : 'bg-green-600 animate-pulse shadow-green-500/50'
                                                        )} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-green-700">
                                                                {notif.pdf.fileName}
                                                            </p>
                                                            <p className="text-xs text-charcoal-600 mt-1">
                                                                Uploaded by <span className="font-medium">{notif.pdf.uploadedBy.fullName}</span>
                                                            </p>
                                                            <p className="text-xs text-charcoal-500 mt-1 flex items-center gap-1">
                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                                </svg>
                                                                {new Date(notif.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Quick Settings */}
                <button className="p-2.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 group">
                    <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" strokeWidth={2} />
                </button>

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-200 border border-green-200 hover:border-green-300 group"
                    >
                        <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                            <User className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="text-left hidden sm:block">
                            <p className="text-sm font-bold text-gray-900 max-w-[120px] truncate">{user.fullName || 'User'}</p>
                            <p className="text-xs text-green-700 font-semibold uppercase tracking-wide">{user.role}</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-green-600 transition-all" />
                    </button>

                    {showUserMenu && (
                        <>
                            <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-green-200 overflow-hidden z-40 animate-slideUp">
                                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                                    <p className="text-sm font-bold text-gray-900 truncate">{user.fullName}</p>
                                    <p className="text-xs text-gray-600 truncate mt-1">{user.email}</p>
                                    <div className="mt-2">
                                        <span className={cn(
                                            'px-3 py-1 rounded-full text-xs font-semibold',
                                            user.role === 'ADMIN' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                        )}>
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-semibold rounded-xl group"
                                    >
                                        <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}


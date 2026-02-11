'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, User, Menu } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import NotificationsPanel from '@/components/notifications/NotificationsPanel';

interface HeaderProps {
    userName?: string;
    userRole?: string;
    userAvatar?: string;
}

export default function Header({ userName = 'Admin User', userRole = 'Super Admin', userAvatar }: HeaderProps) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        await apiClient.logout();
        router.push('/login');
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 lg:left-64 left-0 z-20 px-4 sm:px-6 lg:px-8">
            <div className="h-full flex items-center justify-between">
                {/* Mobile Menu Button */}
                <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <Menu className="w-6 h-6 text-gray-700" />
                </button>
                {/* Search Bar */}
                <div className="flex-1 max-w-xl hidden sm:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white focus:border-teal-500 transition-all text-gray-900 placeholder:text-gray-500"
                        />
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                    {/* Notifications */}
                    <NotificationsPanel />

                    {/* User Profile */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 pr-2 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-gray-900">{userName}</p>
                                <p className="text-xs text-gray-500">{userRole}</p>
                            </div>
                            {userAvatar ? (
                                <img
                                    src={userAvatar}
                                    alt={userName}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                        {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>

                        {/* Dropdown Menu */}
                        {showProfileMenu && (
                            <>
                                <div 
                                    className="fixed inset-0 z-10" 
                                    onClick={() => setShowProfileMenu(false)}
                                />
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        Log Out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

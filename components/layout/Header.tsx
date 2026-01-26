'use client';

import { useState } from 'react';
import { Search, Bell, ChevronDown, User } from 'lucide-react';

interface HeaderProps {
    userName?: string;
    userRole?: string;
    userAvatar?: string;
}

export default function Header({ userName = 'Admin User', userRole = 'Super Admin', userAvatar }: HeaderProps) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    return (
        <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-20 px-8">
            <div className="h-full flex items-center justify-between">
                {/* Search Bar */}
                <div className="flex-1 max-w-xl">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                        />
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <button className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                    </button>

                    {/* User Profile */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-3 pl-3 pr-2 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <div className="text-right">
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
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                    Profile Settings
                                </button>
                                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                    Account Settings
                                </button>
                                <div className="border-t border-gray-200 my-2"></div>
                                <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors">
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

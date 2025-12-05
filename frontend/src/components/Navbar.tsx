'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import SearchBar from '@/components/SearchBar';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import {
    HomeIcon,
    UserGroupIcon,
    BriefcaseIcon,
    ChatBubbleLeftEllipsisIcon,
    BellIcon,
    UserIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeIconSolid,
    UserGroupIcon as UserGroupIconSolid,
    BriefcaseIcon as BriefcaseIconSolid,
    ChatBubbleLeftEllipsisIcon as ChatBubbleLeftEllipsisIconSolid,
    BellIcon as BellIconSolid
} from '@heroicons/react/24/solid';
import { useState } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const { unreadMessages } = useUnreadMessages();

    const navItems = [
        { name: 'Feed', href: '/feed', icon: HomeIcon, activeIcon: HomeIconSolid },
        { name: 'Community', href: '/communities', icon: UserGroupIcon, activeIcon: UserGroupIconSolid },
        { name: 'Jobs', href: '/jobs', icon: BriefcaseIcon, activeIcon: BriefcaseIconSolid },
        { name: 'Messaging', href: '/messaging', icon: ChatBubbleLeftEllipsisIcon, activeIcon: ChatBubbleLeftEllipsisIconSolid },
        { name: 'Notifications', href: '/notifications', icon: BellIcon, activeIcon: BellIconSolid },
    ];

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (!user) return null;

    return (
        <>
            {/* Desktop Navbar */}
            <nav className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-14">
                        <div className="flex items-center flex-1 max-w-2xl">
                            <Link href="/feed" className="flex-shrink-0 flex items-center mr-4">
                                <Logo size="sm" />
                            </Link>
                            <div className="flex-1 max-w-md">
                                <SearchBar />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 lg:space-x-4">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                const Icon = isActive ? item.activeIcon : item.icon;

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`relative flex flex-col items-center justify-center px-3 py-2 rounded-lg text-xs font-medium transition-smooth ${isActive
                                            ? 'text-primary-700'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon className={`h-6 w-6 mb-1 ${isActive ? 'text-primary-700' : ''}`} />
                                        {item.name === 'Messaging' && unreadMessages > 0 && (
                                            <span className="absolute -top-1 right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-semibold text-white shadow-sm">
                                                {unreadMessages > 99 ? '99+' : unreadMessages}
                                            </span>
                                        )}
                                        <span className="text-xs">{item.name}</span>
                                        {isActive && (
                                            <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary-700 rounded-full"></div>
                                        )}
                                    </Link>
                                );
                            })}

                            <div className="relative ml-3 border-l border-gray-200 pl-3">
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex flex-col items-center justify-center text-gray-600 hover:text-gray-900 focus:outline-none px-3 py-2 rounded-lg transition-smooth"
                                >
                                    <img
                                        className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
                                        src={user.profilePicture || user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=5e372b&color=fff`}
                                        alt=""
                                    />
                                    <span className="text-xs font-medium mt-1">Me</span>
                                </button>

                                {showProfileMenu && (
                                    <div
                                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                                        onMouseLeave={() => setShowProfileMenu(false)}
                                    >
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">{user.profession || 'Member'}</p>
                                        </div>
                                        <Link
                                            href="/profile"
                                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <UserIcon className="h-4 w-4 mr-3 text-gray-400" />
                                            View Profile
                                        </Link>
                                        <Link
                                            href="/settings"
                                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <svg className="h-4 w-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Settings & Privacy
                                        </Link>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                                        >
                                            <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Top Bar - Logo and Search Only */}
            <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="px-3 py-2 flex items-center gap-3">
                    <Link href="/feed" className="flex-shrink-0">
                        <Logo size="sm" />
                    </Link>
                    <div className="flex-1">
                        <SearchBar />
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
                <div className="flex items-center justify-around h-14">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = isActive ? item.activeIcon : item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive
                                    ? 'text-gray-900'
                                    : 'text-gray-600'
                                    }`}
                            >
                                <Icon className={`h-6 w-6 ${isActive ? 'text-gray-900' : 'text-gray-600'}`} />
                                {item.name === 'Messaging' && unreadMessages > 0 && (
                                    <span className="absolute top-1 right-1/4 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-semibold text-white">
                                        {unreadMessages > 9 ? '9+' : unreadMessages}
                                    </span>
                                )}
                                <span className="text-[10px] mt-0.5 font-medium">{item.name}</span>
                            </Link>
                        );
                    })}

                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="relative flex flex-col items-center justify-center flex-1 h-full text-gray-600"
                    >
                        <img
                            className="h-6 w-6 rounded-full object-cover border border-gray-300"
                            src={user.profilePicture || user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=5e372b&color=fff`}
                            alt=""
                        />
                        <span className="text-[10px] mt-0.5 font-medium">Me</span>
                    </button>

                    {showProfileMenu && (
                        <div
                            className="absolute bottom-full right-2 mb-2 w-56 bg-white rounded-xl shadow-lg py-2 ring-1 ring-black ring-opacity-5 z-50"
                            onClick={() => setShowProfileMenu(false)}
                        >
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                                <p className="text-xs text-gray-500 truncate mt-0.5">{user.profession || 'Member'}</p>
                            </div>
                            <Link
                                href="/profile"
                                className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <UserIcon className="h-4 w-4 mr-3 text-gray-400" />
                                View Profile
                            </Link>
                            <Link
                                href="/settings"
                                className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <svg className="h-4 w-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Settings & Privacy
                            </Link>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                            >
                                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
}

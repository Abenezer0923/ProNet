'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import SearchBar from '@/components/SearchBar';
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
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/feed" className="flex-shrink-0 flex items-center">
                            <Logo size="sm" />
                        </Link>
                        <div className="hidden md:ml-6 md:flex md:space-x-8">
                            <SearchBar />
                        </div>
                    </div>

                    <div className="flex items-center space-x-1 sm:space-x-4">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = isActive ? item.activeIcon : item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg text-xs font-medium transition-smooth ${isActive
                                        ? 'text-primary-900 border-b-2 border-primary-700'
                                        : 'text-gray-500 hover:text-primary-800 hover:bg-primary-50'
                                        }`}
                                >
                                    <Icon className="h-6 w-6 mb-1" />
                                    <span className="hidden md:block">{item.name}</span>
                                </Link>
                            );
                        })}

                        <div className="relative ml-3">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex flex-col items-center justify-center text-gray-500 hover:text-gray-900 focus:outline-none"
                            >
                                <img
                                    className="h-8 w-8 rounded-full object-cover border border-gray-200"
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`}
                                    alt=""
                                />
                                <span className="hidden md:block text-xs font-medium mt-1">Me</span>
                            </button>

                            {showProfileMenu && (
                                <div
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none"
                                    onMouseLeave={() => setShowProfileMenu(false)}
                                >
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.profession}</p>
                                    </div>
                                    <Link
                                        href="/profile"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setShowProfileMenu(false)}
                                    >
                                        View Profile
                                    </Link>
                                    <Link
                                        href="/settings"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setShowProfileMenu(false)}
                                    >
                                        Settings & Privacy
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                                    >
                                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

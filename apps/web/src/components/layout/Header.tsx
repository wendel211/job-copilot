'use client';

import {
    Menu,
    Bell
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { CreditsDisplay } from '@/components/credits/CreditsDisplay';

interface HeaderProps {
    onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
    const { user } = useAppStore();

    return (
        <header className="h-20 bg-white flex items-center px-8 justify-between shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-4 flex-1">
                {/* Mobile Menu */}
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl lg:hidden transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-3 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all border border-transparent hover:border-emerald-100">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </button>

                {/* Credits Display */}
                <CreditsDisplay />

                {/* User Profile - Header Version */}
                <div className="hidden sm:flex items-center gap-3 pl-2">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center text-gray-500 font-bold">
                        {user?.fullName?.charAt(0) || 'U'}
                    </div>
                </div>
            </div>
        </header>
    );
};

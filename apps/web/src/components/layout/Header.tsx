'use client';

import React, { useState, useEffect } from 'react';
import {
    Menu,
    Wifi,
    WifiOff,
    RefreshCw,
    Bell,
    HelpCircle
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { CreditsDisplay } from '@/components/credits/CreditsDisplay';

interface HeaderProps {
    onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
    const { user } = useAppStore();
    const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

    const checkApiStatus = async () => {
        setApiStatus('checking');
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
            const res = await fetch(`${apiUrl}/health`);
            setApiStatus(res.ok ? 'online' : 'offline');
        } catch {
            setApiStatus('offline');
        }
    };

    useEffect(() => {
        if (user) {
            checkApiStatus();
            const interval = setInterval(checkApiStatus, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    return (
        <header className="h-16 bg-white/80 backdrop-blur-lg border-b border-gray-100 flex items-center px-4 sm:px-6 justify-between shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                {/* Mobile Menu */}
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl lg:hidden transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
                {/* Credits Display */}
                <CreditsDisplay />

                {/* Notifications */}
                <button className="relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full" />
                </button>

                {/* Help */}
                <button className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors hidden sm:flex">
                    <HelpCircle className="w-5 h-5" />
                </button>

                {/* API Status */}
                <div
                    className={`
            flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all
            ${apiStatus === 'online'
                            ? 'bg-emerald-50 text-emerald-600'
                            : apiStatus === 'offline'
                                ? 'bg-red-50 text-red-600'
                                : 'bg-amber-50 text-amber-600'
                        }
          `}
                >
                    {apiStatus === 'checking' && <RefreshCw className="w-3 h-3 animate-spin" />}
                    {apiStatus === 'online' && <Wifi className="w-3 h-3" />}
                    {apiStatus === 'offline' && <WifiOff className="w-3 h-3" />}
                    <span className="hidden sm:inline">
                        {apiStatus === 'online' ? 'Online' : apiStatus === 'offline' ? 'Offline' : '...'}
                    </span>
                </div>
            </div>
        </header>
    );
};

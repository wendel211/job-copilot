'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Briefcase,
  LogOut,
  Menu,
  User,
  X,
  CopyCheck,
  Trello,
  LayoutDashboard,
  FileText,
  Settings,
  Wifi,
  WifiOff,
  RefreshCw,
  Search,
  Zap,
  ChevronLeft,
  ChevronRight,
  Bell,
  HelpCircle
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { CreditsDisplay } from '@/components/credits/CreditsDisplay';

// ============================================================================
// NAVEGAÇÃO
// ============================================================================
const navItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: 'text-emerald-500'
  },
  {
    label: 'Vagas',
    icon: Search,
    href: '/jobs',
    color: 'text-blue-500'
  },
  {
    label: 'Candidaturas',
    icon: CopyCheck,
    href: '/applications',
    color: 'text-violet-500'
  },
  {
    label: 'Pipeline',
    icon: Trello,
    href: '/pipeline',
    color: 'text-amber-500'
  },
  {
    label: 'Rascunhos',
    icon: FileText,
    href: '/drafts',
    color: 'text-rose-500'
  },
];

const bottomNavItems = [
  {
    label: 'Configurações',
    icon: Settings,
    href: '/settings',
    color: 'text-slate-500'
  },
];

// ============================================================================
// COMPONENTE APPSHELL - CLEAN & MINIMAL
// ============================================================================
export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const { user, logout } = useAppStore();

  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

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

  if (!user) return null;

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 flex">
      {/* ==================== MOBILE OVERLAY ==================== */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* ==================== SIDEBAR - FIXED ==================== */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen
          ${isExpanded ? 'w-64' : 'w-20'}
          bg-white border-r border-gray-100
          transition-all duration-300 ease-in-out
          lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
          shadow-sm
        `}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center ${isExpanded ? 'px-5' : 'px-0 justify-center'} border-b border-gray-100`}>
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-md shadow-emerald-200">
              <Zap className="w-5 h-5 text-white" />
            </div>
            {isExpanded && (
              <span className="text-lg font-bold text-gray-800">JobCopilot</span>
            )}
          </Link>

          {/* Close button - Mobile */}
          <button
            onClick={toggleSidebar}
            className="ml-auto lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 ${isExpanded ? 'px-3' : 'px-2'} py-4 space-y-1`}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  group relative flex items-center ${isExpanded ? 'gap-3 px-3' : 'justify-center px-0'} py-3 rounded-xl
                  transition-all duration-200
                  ${isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }
                `}
                title={!isExpanded ? item.label : undefined}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-emerald-500`} />
                )}

                <div className={`
                  flex items-center justify-center w-9 h-9 rounded-lg transition-colors
                  ${isActive ? 'bg-white shadow-sm' : 'group-hover:bg-white group-hover:shadow-sm'}
                `}>
                  <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-gray-400 group-hover:text-gray-600'}`} />
                </div>

                {isExpanded && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}

                {/* Tooltip for collapsed state */}
                {!isExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="my-4">
            <div className="h-px bg-gray-100" />
          </div>

          {/* Bottom Items */}
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  group relative flex items-center ${isExpanded ? 'gap-3 px-3' : 'justify-center px-0'} py-3 rounded-xl
                  transition-all duration-200
                  ${isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }
                `}
                title={!isExpanded ? item.label : undefined}
              >
                <div className={`
                  flex items-center justify-center w-9 h-9 rounded-lg transition-colors
                  ${isActive ? 'bg-white shadow-sm' : 'group-hover:bg-white group-hover:shadow-sm'}
                `}>
                  <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-gray-400 group-hover:text-gray-600'}`} />
                </div>

                {isExpanded && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}

                {!isExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className={`${isExpanded ? 'px-3' : 'px-2'} pb-2`}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
              w-full flex items-center ${isExpanded ? 'gap-3 px-3' : 'justify-center'} py-3 rounded-xl
              text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors
            `}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white hover:shadow-sm transition-colors">
              {isExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </div>
            {isExpanded && <span className="text-sm font-medium">Recolher</span>}
          </button>
        </div>

        {/* User Section */}
        <div className={`${isExpanded ? 'p-4' : 'p-2'} border-t border-gray-100`}>
          <div className={`flex items-center ${isExpanded ? 'gap-3' : 'justify-center'} ${isExpanded ? 'mb-3' : 'mb-2'}`}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm border border-gray-200">
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
            </div>
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {user?.fullName || 'Usuário'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email || 'email@example.com'}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className={`
              w-full flex items-center ${isExpanded ? 'gap-3 px-3' : 'justify-center'} py-2.5 rounded-xl
              text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors
            `}
            title={!isExpanded ? 'Sair' : undefined}
          >
            <LogOut className="w-4 h-4" />
            {isExpanded && <span className="text-sm font-medium">Sair</span>}
          </button>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT ==================== */}
      <div
        className={`
          flex-1 flex flex-col min-w-0 overflow-hidden
          transition-all duration-300
          ${isExpanded ? 'lg:ml-64' : 'lg:ml-20'}
        `}
      >
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-lg border-b border-gray-100 flex items-center px-4 sm:px-6 justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Mobile Menu */}
            <button
              onClick={toggleSidebar}
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

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
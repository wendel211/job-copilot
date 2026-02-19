'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Briefcase,
  LogOut,
  User,
  X,
  CopyCheck,
  Trello,
  LayoutDashboard,
  FileText,
  Settings,
  Search,
  Zap,
  ChevronLeft,
  ChevronRight,
  CreditCard
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Header } from './Header';

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
    label: 'Planos',
    icon: CreditCard,
    href: '/pricing',
    color: 'text-green-500'
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

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

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
          bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out
          lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col shadow-xl shadow-gray-200/50
        `}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center ${isExpanded ? 'px-6' : 'px-0 justify-center'} mb-6`}>
          {/* Close button - Mobile */}
          <button
            onClick={toggleSidebar}
            className="ml-auto lg:hidden p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-4 mb-2">
          {isExpanded && <p className="text-xs font-semibold text-gray-500 mb-4 px-2 tracking-wide uppercase">Menu Principal</p>}
        </div>

        <nav className={`flex-1 px-4 space-y-1`}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  group relative flex items-center ${isExpanded ? 'gap-3 px-4' : 'justify-center px-0'} py-3.5 rounded-2xl
                  transition-all duration-200
                  ${isActive
                    ? 'bg-gray-100 text-gray-900 font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                title={!isExpanded ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-900'}`} />

                {isExpanded && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}

                {/* Tooltip for collapsed state */}
                {!isExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="py-4">
            {isExpanded && <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />}
          </div>

          <div className="mb-2">
            {isExpanded && <p className="text-xs font-semibold text-gray-500 mb-4 px-2 tracking-wide uppercase">Conta</p>}
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
                  group relative flex items-center ${isExpanded ? 'gap-3 px-4' : 'justify-center px-0'} py-3.5 rounded-2xl
                  transition-all duration-200
                  ${isActive
                    ? 'bg-gray-100 text-gray-900 font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                title={!isExpanded ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-900'}`} />

                {isExpanded && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}

                {!isExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className={`px-4 pb-4`}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
              w-full flex items-center ${isExpanded ? 'gap-3 px-4' : 'justify-center'} py-3 rounded-2xl
              text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors
            `}
          >
            {isExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            {isExpanded && <span className="text-sm font-medium">Recolher</span>}
          </button>
        </div>

        {isExpanded && (
          <div className="px-6 pb-6 space-y-3">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-100">

            </div>

            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Sair</span>
            </button>
          </div>
        )}
      </aside>

      {/* ==================== MAIN CONTENT ==================== */}
      <div
        className={`
          flex-1 flex flex-col min-w-0 overflow-hidden
          transition-all duration-300
          ${isExpanded ? 'lg:ml-64' : 'lg:ml-20'}
        `}
      >
        <Header onMenuClick={toggleSidebar} />

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
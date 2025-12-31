'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  LogOut,
  Menu,
  User,
  X,
  Trello,           // Pipeline
  LayoutDashboard,  // Dashboard
  FileText,         // Rascunhos
  Settings,         // Configurações
  Wifi,             // Online
  WifiOff,          // Offline
  RefreshCw         // Loading/Retry
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';

// ============================================================================
// NAVEGAÇÃO
// ============================================================================
const navItems = [
  { 
    label: 'Dashboard', 
    icon: <LayoutDashboard className="w-5 h-5" />, 
    href: '/dashboard' 
  },
  { 
    label: 'Vagas', 
    icon: <Briefcase className="w-5 h-5" />, 
    href: '/jobs' 
  },
  { 
    label: 'Pipeline', 
    icon: <Trello className="w-5 h-5" />, 
    href: '/pipeline' 
  },
  { 
    label: 'Rascunhos', 
    icon: <FileText className="w-5 h-5" />, 
    href: '/drafts' 
  },
  { 
    label: 'Configurações', 
    icon: <Settings className="w-5 h-5" />, 
    href: '/settings' 
  },
];

// ============================================================================
// COMPONENTE APPSHELL
// ============================================================================
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAppStore();

  // Estados de Conexão da API
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Verifica status da API ao montar
  const checkApiStatus = async () => {
    setApiStatus('checking');
    try {
      // Tenta bater no endpoint de saúde da API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3003';
      const res = await fetch(`${apiUrl}/health`);
      if (res.ok) {
        setApiStatus('online');
      } else {
        setApiStatus('offline');
      }
    } catch (error) {
      setApiStatus('offline');
    }
  };

  useEffect(() => {
    checkApiStatus();
    // Opcional: Revalidar a cada 30 segundos
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* -----------------------------------------------------------------------
        SIDEBAR MOBILE (OVERLAY)
        -----------------------------------------------------------------------
      */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:block
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo Area */}
          <div className="h-16 flex items-center px-6 border-b border-gray-100">
            <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
              <Briefcase className="w-6 h-6" />
              <span>JobCopilot</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="ml-auto lg:hidden text-gray-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <span className={isActive ? 'text-blue-600' : 'text-gray-500'}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Footer */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                {user?.fullName?.charAt(0) || <User className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.fullName || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* -----------------------------------------------------------------------
        MAIN CONTENT
        -----------------------------------------------------------------------
      */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Unificado (Desktop & Mobile) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 sm:px-6 justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-semibold text-lg text-gray-900 capitalize">
              {navItems.find(i => i.href === pathname)?.label || 'JobCopilot'}
            </h1>
          </div>

          {/* API Status Indicator */}
          <div className="flex items-center gap-3">
             <div 
               className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
                 apiStatus === 'online' 
                   ? 'bg-green-50 text-green-700 border-green-200' 
                   : apiStatus === 'offline'
                   ? 'bg-red-50 text-red-700 border-red-200'
                   : 'bg-yellow-50 text-yellow-700 border-yellow-200'
               }`}
               title={apiStatus === 'online' ? 'API Conectada' : 'API Desconectada'}
             >
               {apiStatus === 'checking' && <RefreshCw className="w-3 h-3 animate-spin" />}
               {apiStatus === 'online' && <Wifi className="w-3 h-3" />}
               {apiStatus === 'offline' && <WifiOff className="w-3 h-3" />}
               
               <span className="hidden sm:inline">
                 {apiStatus === 'online' ? 'API Online' : apiStatus === 'offline' ? 'API Offline' : 'Verificando...'}
               </span>
             </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-gray-50/50">
          <div className="max-w-7xl mx-auto w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
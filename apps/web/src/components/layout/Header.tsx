'use client';

import { useState, useEffect } from 'react';
import {
    Menu,
    Bell,
    Calendar,
    RefreshCcw,
    Sparkles,
    CheckCircle2
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { pipelineApi, jobsApi } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CreditsDisplay } from '@/components/credits/CreditsDisplay';

interface HeaderProps {
    onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
    const { user } = useAppStore();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user?.id) return;

            try {
                // 1. Buscar itens da pipeline (Ofertas, Rejeições, Entrevistas)
                const pipelineItems = await pipelineApi.list(user.id);

                // Filtrar e mapear itens relevantes
                const relevantPipeline = pipelineItems
                    .filter(item => ['offer', 'rejected', 'interview'].includes(item.status))
                    .map(item => {
                        let config = {
                            title: 'Atualização na Pipeline',
                            description: `Vaga: ${item.job.title}`,
                            icon: RefreshCcw,
                            color: 'text-gray-600 bg-gray-50'
                        };

                        if (item.status === 'offer') {
                            config = {
                                title: 'Proposta Recebida!',
                                description: `Proposta para ${item.job.title} em ${item.job.company.name}`,
                                icon: CheckCircle2,
                                color: 'text-emerald-600 bg-emerald-50'
                            };
                        } else if (item.status === 'rejected') {
                            config = {
                                title: 'Processo Finalizado',
                                description: `Não selecionado para ${item.job.title}`,
                                icon: RefreshCcw, // Using Refresh as XCircle is not imported
                                color: 'text-red-600 bg-red-50'
                            };
                        } else if (item.status === 'interview') {
                            config = {
                                title: 'Entrevista',
                                description: `Entrevista para ${item.job.title}`,
                                icon: Calendar,
                                color: 'text-blue-600 bg-blue-50'
                            };
                        }

                        return {
                            id: `pipeline-${item.id}`,
                            ...config,
                            time: formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true, locale: ptBR }),
                            read: false, // Na prática precisaria de um estado de leitura salvo no backend
                            originalDate: new Date(item.updatedAt)
                        };
                    });

                // 2. Buscar recomendações (Novas vagas)
                const recommendations = await jobsApi.getRecommendations();

                // Pegar as 2 mais recentes
                const recentRecommendations = recommendations.slice(0, 2).map(job => ({
                    id: `job-${job.id}`,
                    title: 'Nova Recomendação',
                    description: `${job.title} na ${job.company.name}`,
                    icon: Sparkles,
                    color: 'text-amber-500 bg-amber-50',
                    time: formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: ptBR }),
                    read: false,
                    originalDate: new Date(job.createdAt)
                }));

                // Combinar e ordenar por data
                const allNotifications = [...relevantPipeline, ...recentRecommendations]
                    .sort((a, b) => b.originalDate.getTime() - a.originalDate.getTime());

                setNotifications(allNotifications);

            } catch (error) {
                console.error('Erro ao buscar notificações:', error);
            }
        };

        fetchNotifications();
    }, [user?.id]);

    const unreadCount = notifications.filter(n => !n.read).length;

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
            <div className="flex items-center gap-4 relative">
                {/* Notifications Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-3 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all border ${showNotifications ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'border-transparent hover:border-emerald-100'}`}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        )}
                    </button>

                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <h3 className="font-semibold text-gray-900">Notificações</h3>
                                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{unreadCount} novas</span>
                                </div>
                                <div className="max-h-[320px] overflow-y-auto">
                                    {notifications.map((notification) => {
                                        const Icon = notification.icon;
                                        return (
                                            <div key={notification.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!notification.read ? 'bg-emerald-50/10' : ''}`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notification.color}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-0.5">
                                                        <h4 className={`text-sm font-semibold leading-tight ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                                            {notification.title}
                                                        </h4>
                                                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2 font-medium">{notification.time}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 leading-snug">{notification.description}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="p-3 border-t border-gray-100 text-center">
                                    <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                                        Marcar todas como lidas
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

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

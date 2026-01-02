'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { statsApi } from '@/lib/api'; // 
import AppShell from '@/components/layout/AppShell';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Briefcase,
  Send,
  Calendar,
  TrendingUp,
  Plus,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';

// ============================================================================
// TYPES & HELPERS
// ============================================================================

// Tipagem exata do retorno do Backend
interface DashboardData {
  overview: {
    total: number;
    applied: number;
    interviews: number;
    offers: number;
    rejected: number;
    drafts: number;
  };
  recentActivity: Array<{
    id: string;
    status: string;
    updatedAt: string;
    job: {
      title: string;
      company: { name: string };
    };
  }>;
}

// Função simples para formatar "Há X tempo"
function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'agora mesmo';
  if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)}min`;
  if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)}h`;
  return `há ${Math.floor(diffInSeconds / 86400)}d`;
}

// Tradução de status para ícones e cores
const getStatusConfig = (status: string) => {
  switch (status) {
    case 'discovered':
    case 'prepared':
      return { label: 'Salvo', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100' };
    case 'applied':
    case 'sent':
      return { label: 'Aplicado', icon: Send, color: 'text-green-600', bg: 'bg-green-100' };
    case 'interview':
    case 'screening':
      return { label: 'Entrevista', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100' };
    case 'offer':
      return { label: 'Proposta', icon: TrendingUp, color: 'text-yellow-600', bg: 'bg-yellow-100' };
    case 'rejected':
      return { label: 'Rejeitado', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' };
    default:
      return { label: 'Atualizado', icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100' };
  }
};

// ============================================================================
// COMPONENTES VISUAIS
// ============================================================================

const StatsCard = ({ title, value, icon, color, loading }: any) => {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            {loading ? (
              <div className="h-9 w-16 bg-gray-100 animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold text-gray-900">{value}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

const ActivityItem = ({ activity }: { activity: DashboardData['recentActivity'][0] }) => {
  const config = getStatusConfig(activity.status);
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0">
      <div className={`p-2 rounded-lg ${config.bg}`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{activity.job.title}</p>
        <p className="text-xs text-gray-500 truncate">{activity.job.company.name} • <span className="font-medium">{config.label}</span></p>
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">{formatTimeAgo(activity.updatedAt)}</span>
    </div>
  );
};

// ============================================================================
// PÁGINA PRINCIPAL
// ============================================================================
export default function DashboardPage() {
  const { user, userId } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    overview: { total: 0, applied: 0, interviews: 0, offers: 0, rejected: 0, drafts: 0 },
    recentActivity: []
  });

  // 🔄 Busca dados reais da API
  useEffect(() => {
    async function loadData() {
      if (!userId) return;
      try {
        const stats = await statsApi.getSummary(userId);
        setData(stats);
      } catch (error) {
        console.error('Falha ao carregar dashboard:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId]);

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in pb-10">
        {/* Header Personalizado */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Olá, {user?.fullName?.split(' ')[0] || 'Visitante'} 👋
            </h1>
            <p className="text-gray-600 mt-1">
              {loading 
                ? 'Carregando suas estatísticas...' 
                : `Você tem ${data.overview.total} oportunidades ativas no seu radar.`}
            </p>
          </div>
          <div className="flex gap-3">
             <Link href="/jobs">
               <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                 <Plus className="w-4 h-4 mr-2" />
                 Adicionar Vaga
               </Button>
             </Link>
          </div>
        </div>

        {/* 📊 GRID DE ESTATÍSTICAS (Colorido e Conectado) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="No Pipeline"
            value={data.overview.total}
            icon={<Briefcase className="w-6 h-6" />}
            color="blue"
            loading={loading}
          />
          <StatsCard
            title="Candidaturas"
            value={data.overview.applied}
            icon={<Send className="w-6 h-6" />}
            color="green"
            loading={loading}
          />
          <StatsCard
            title="Entrevistas"
            value={data.overview.interviews}
            icon={<Calendar className="w-6 h-6" />}
            color="purple"
            loading={loading}
          />
          <StatsCard
            title="Rascunhos"
            value={data.overview.drafts}
            icon={<TrendingUp className="w-6 h-6" />}
            color="orange"
            loading={loading}
          />
        </div>

        {/* 📋 CONTEÚDO PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Feed de Atividades */}
          <Card className="lg:col-span-2 shadow-sm border-gray-200">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  Atividade Recente
                </h2>
                {!loading && (
                   <Badge variant="default">
                     {data.recentActivity.length} atualizações
                   </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto">
                {loading ? (
                   <div className="p-8 text-center text-gray-500">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 opacity-50" />
                      Carregando feed...
                   </div>
                ) : data.recentActivity.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhuma atividade recente.</p>
                    <p className="text-sm">Comece salvando ou importando vagas!</p>
                  </div>
                ) : (
                  data.recentActivity.map((item) => (
                    <ActivityItem key={item.id} activity={item} />
                  ))
                )}
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <Link
                  href="/pipeline"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 transition-transform hover:translate-x-1 w-fit"
                >
                  Ver pipeline completo
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Coluna Lateral: Ações e Resumo Extra */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-gray-900">Ações Rápidas</h2>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/jobs">
                  <Button variant="outline" className="w-full justify-start hover:bg-gray-50 hover:border-blue-200">
                    <Briefcase className="w-4 h-4 mr-2 text-blue-500" />
                    Buscar Vagas
                  </Button>
                </Link>
                <Link href="/pipeline">
                  <Button variant="outline" className="w-full justify-start hover:bg-gray-50 hover:border-purple-200">
                    <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                    Gerenciar Pipeline
                  </Button>
                </Link>
                <Link href="/drafts">
                  <Button variant="outline" className="w-full justify-start hover:bg-gray-50 hover:border-orange-200">
                    <Send className="w-4 h-4 mr-2 text-orange-500" />
                    Rascunhos ({data.overview.drafts})
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Card de Rejeições (Opcional, mas útil para realidade) */}
            <Card className="bg-red-50 border-red-100">
               <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-white rounded-full shadow-sm">
                     <XCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                     <p className="text-sm text-red-800 font-medium">Rejeições</p>
                     <p className="text-2xl font-bold text-red-900">{data.overview.rejected}</p>
                  </div>
               </CardContent>
            </Card>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  💡 Dica Pro
                </h3>
                <p className="text-sm text-blue-800 leading-relaxed">
                  Candidatos que enviam emails personalizados têm <strong>3x mais chances</strong> de resposta. Use o gerador de IA na aba de Vagas!
                </p>
              </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
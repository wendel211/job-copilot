'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { statsApi } from '@/lib/api';
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
  Loader2,
  Sparkles,
  Target,
  FileText,
  Zap,
  BarChart3
} from 'lucide-react';

// ============================================================================
// TYPES & HELPERS
// ============================================================================

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

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'agora';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  return `${Math.floor(diffInSeconds / 86400)}d`;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'discovered':
    case 'prepared':
      return { label: 'Salvo', icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-100' };
    case 'applied':
    case 'sent':
      return { label: 'Aplicado', icon: Send, color: 'text-green-600', bg: 'bg-green-100' };
    case 'interview':
    case 'screening':
      return { label: 'Entrevista', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100' };
    case 'offer':
      return { label: 'Proposta', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-100' };
    case 'rejected':
      return { label: 'Rejeitado', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' };
    default:
      return { label: 'Atualizado', icon: Clock, color: 'text-slate-600', bg: 'bg-slate-100' };
  }
};

// ============================================================================
// COMPONENTES VISUAIS
// ============================================================================

const StatsCard = ({ title, value, icon, gradient, loading }: any) => {
  const gradients: any = {
    emerald: 'from-emerald-500 to-green-600',
    green: 'from-green-500 to-teal-600',
    purple: 'from-purple-500 to-indigo-600',
    amber: 'from-amber-500 to-orange-600',
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-2">{title}</p>
          {loading ? (
            <div className="h-10 w-20 bg-slate-100 animate-pulse rounded-lg" />
          ) : (
            <p className="text-4xl font-bold text-slate-900">{value}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradients[gradient]} shadow-lg`}>
          <span className="text-white">{icon}</span>
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl bg-gradient-to-r ${gradients[gradient]} opacity-0 group-hover:opacity-100 transition-opacity`} />
    </div>
  );
};

const ActivityItem = ({ activity }: { activity: DashboardData['recentActivity'][0] }) => {
  const config = getStatusConfig(activity.status);
  const Icon = config.icon;

  return (
    <div className="group flex items-center gap-4 p-4 hover:bg-emerald-50/50 rounded-xl transition-all border-b border-slate-100 last:border-0">
      <div className={`p-2.5 rounded-xl ${config.bg} transition-transform group-hover:scale-110`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{activity.job.title}</p>
        <p className="text-xs text-slate-500 truncate">
          {activity.job.company.name} • <span className={`font-medium ${config.color}`}>{config.label}</span>
        </p>
      </div>
      <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded-full">{formatTimeAgo(activity.updatedAt)}</span>
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

        {/* Header com Gradiente */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 p-8 text-white shadow-xl shadow-emerald-500/20">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-emerald-200" />
                <span className="text-emerald-100 text-sm font-medium">Painel Inteligente</span>
              </div>
              <h1 className="text-3xl font-bold mb-1">
                Olá, {user?.fullName?.split(' ')[0] || 'Visitante'} 👋
              </h1>
              <p className="text-emerald-100">
                {loading
                  ? 'Carregando suas estatísticas...'
                  : `Você tem ${data.overview.total} oportunidades ativas no seu pipeline.`}
              </p>
            </div>
            <Link href="/jobs">
              <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/30 font-semibold px-6 py-3 rounded-xl border border-slate-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Vaga
              </Button>
            </Link>
          </div>
        </div>

        {/* 📊 GRID DE ESTATÍSTICAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="No Pipeline"
            value={data.overview.total}
            icon={<Target className="w-6 h-6" />}
            gradient="emerald"
            loading={loading}
          />
          <StatsCard
            title="Candidaturas"
            value={data.overview.applied}
            icon={<Send className="w-6 h-6" />}
            gradient="green"
            loading={loading}
          />
          <StatsCard
            title="Entrevistas"
            value={data.overview.interviews}
            icon={<Calendar className="w-6 h-6" />}
            gradient="purple"
            loading={loading}
          />
          <StatsCard
            title="Rascunhos"
            value={data.overview.drafts}
            icon={<FileText className="w-6 h-6" />}
            gradient="amber"
            loading={loading}
          />
        </div>

        {/* 📋 CONTEÚDO PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Feed de Atividades */}
          <Card className="lg:col-span-2 shadow-lg shadow-slate-200/50 border-slate-100 overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-100">
                    <Clock className="w-4 h-4 text-emerald-600" />
                  </div>
                  Atividade Recente
                </h2>
                {!loading && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                    {data.recentActivity.length} atualizações
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-500" />
                    Carregando feed...
                  </div>
                ) : data.recentActivity.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="text-slate-700 font-medium">Nenhuma atividade recente</p>
                    <p className="text-sm text-slate-500 mt-1">Comece salvando ou importando vagas!</p>
                  </div>
                ) : (
                  data.recentActivity.map((item) => (
                    <ActivityItem key={item.id} activity={item} />
                  ))
                )}
              </div>

              <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-t border-emerald-100">
                <Link
                  href="/pipeline"
                  className="text-sm text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-2 transition-transform hover:translate-x-1 w-fit"
                >
                  Ver pipeline completo
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Coluna Lateral */}
          <div className="space-y-6">
            <Card className="shadow-lg shadow-slate-200/50 border-slate-100">
              <CardHeader className="pb-2">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  Ações Rápidas
                </h2>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/jobs">
                  <Button variant="outline" className="w-full justify-start hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 rounded-xl transition-all">
                    <Briefcase className="w-4 h-4 mr-3 text-emerald-500" />
                    Buscar Vagas
                  </Button>
                </Link>
                <Link href="/pipeline">
                  <Button variant="outline" className="w-full justify-start hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 rounded-xl transition-all">
                    <Calendar className="w-4 h-4 mr-3 text-purple-500" />
                    Gerenciar Pipeline
                  </Button>
                </Link>
                <Link href="/drafts">
                  <Button variant="outline" className="w-full justify-start hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 rounded-xl transition-all">
                    <Send className="w-4 h-4 mr-3 text-amber-500" />
                    Rascunhos ({data.overview.drafts})
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Card de Rejeições */}
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl border border-red-100 p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-red-100">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-red-700 font-medium">Rejeições</p>
                  <p className="text-3xl font-bold text-red-900">{data.overview.rejected}</p>
                </div>
              </div>
            </div>

            {/* Dica Pro */}
            <div className="relative overflow-hidden p-5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl text-white shadow-lg shadow-emerald-500/25">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
              <div className="relative z-10">
                <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Dica Pro
                </h3>
                <p className="text-sm text-emerald-50 leading-relaxed">
                  Candidatos que enviam emails personalizados têm <strong>3x mais chances</strong> de resposta. Use o gerador de IA!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
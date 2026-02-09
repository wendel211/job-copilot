'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { statsApi } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import {
  Briefcase,
  Send,
  Calendar,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  Loader2,
  MoreHorizontal,
  Search,
  CheckCircle2,
  FileText
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

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'discovered':
    case 'prepared':
      return { label: 'Salvo', color: 'text-emerald-600', bg: 'bg-emerald-100' };
    case 'applied':
    case 'sent':
      return { label: 'Aplicado', color: 'text-blue-600', bg: 'bg-blue-100' };
    case 'interview':
    case 'screening':
      return { label: 'Entrevista', color: 'text-purple-600', bg: 'bg-purple-100' };
    case 'offer':
      return { label: 'Proposta', color: 'text-amber-600', bg: 'bg-amber-100' };
    case 'rejected':
      return { label: 'Rejeitado', color: 'text-red-400', bg: 'bg-red-50' };
    default:
      return { label: 'Atualizado', color: 'text-gray-600', bg: 'bg-gray-100' };
  }
};

// ============================================================================
// COMPONENTES VISUAIS
// ============================================================================

const StatsCard = ({ title, subtitle, count, total, icon, colorClass, bgClass }: any) => {
  return (
    <div className="relative p-6 rounded-3xl bg-white border border-emerald-50 hover:border-emerald-200 shadow-sm hover:shadow-lg hover:shadow-emerald-500/5 transition-all group">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 ${bgClass} group-hover:scale-110 transition-transform`}>
        {React.cloneElement(icon, { className: `w-5 h-5 ${colorClass}` })}
      </div>

      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-bold text-gray-900">{count}</span>
        <span className="text-sm text-gray-400">/ {total} Total</span>
      </div>

      <p className="text-xs font-medium text-emerald-600/80">{subtitle}</p>
    </div>
  );
};

const ActivityCard = ({ activity }: { activity: DashboardData['recentActivity'][0] }) => {
  const config = getStatusConfig(activity.status);

  return (
    <div className="bg-white p-4 rounded-3xl shadow-sm border border-emerald-50 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all flex flex-col gap-3 group relative cursor-pointer">
      <div className="absolute top-4 right-4 text-gray-300 hover:text-emerald-600 transition-colors">
        <MoreHorizontal className="w-5 h-5" />
      </div>

      <div className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
        <Briefcase className={`w-6 h-6 ${config.color}`} />
      </div>

      <div>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color} mb-1 block`}>
          {config.label}
        </span>
        <h4 className="font-bold text-gray-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">{activity.job.title}</h4>
        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
          {activity.job.company.name} • Atualização recente
        </p>
      </div>
    </div>
  );
};

const PipelineProgress = ({ label, value, color }: { label: string, value: number, color: string }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-semibold text-gray-700">
        <span>{label}</span>
      </div>
      <div className="h-3 w-full bg-emerald-50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 shadow-sm`}
          style={{ width: `${Math.min(100, Math.max(5, value))}%` }}
        />
      </div>
    </div>
  );
}

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
      <div className="space-y-8 pb-10 max-w-7xl mx-auto px-4 sm:px-0">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent inline-block">Visão Geral</h1>
            <p className="text-gray-500 text-sm mt-1">Acompanhe o progresso da sua busca</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/jobs">
              <Button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl px-6 py-3 h-auto font-semibold shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5">
                <Plus className="w-4 h-4 mr-2" />
                Nova Vaga
              </Button>
            </Link>
          </div>
        </div>

        {/* 📊 GRID DE ESTATÍSTICAS (MY TASK) */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
            Métricas Principais
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Candidaturas"
              subtitle="Enviadas"
              count={`${data.overview.applied}`}
              total={data.overview.total}
              icon={<Send />}
              colorClass="text-emerald-600"
              bgClass="bg-emerald-50"
            />
            <StatsCard
              title="Entrevistas"
              subtitle="Agendadas"
              count={`${data.overview.interviews}`}
              total={data.overview.total}
              icon={<Calendar />}
              colorClass="text-blue-500"
              bgClass="bg-blue-50"
            />
            <StatsCard
              title="Rascunhos"
              subtitle="Em preparação"
              count={`${data.overview.drafts}`}
              total={data.overview.total}
              icon={<FileText />}
              colorClass="text-purple-500"
              bgClass="bg-purple-50"
            />
            <StatsCard
              title="Em Andamento"
              subtitle="No Pipeline"
              count={`${data.overview.total - data.overview.rejected}`}
              total={data.overview.total}
              icon={<Clock />}
              colorClass="text-orange-500"
              bgClass="bg-orange-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recently Visit (Activity Feed) */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                Atividade Recente
              </h2>
              <Link href="/pipeline" className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold hover:underline">Ver pipeline</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                <div className="col-span-2 py-12 flex justify-center text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
              ) : data.recentActivity.length === 0 ? (
                <div className="col-span-2 bg-emerald-50/50 rounded-3xl p-8 text-center border-2 border-dashed border-emerald-100">
                  <p className="text-gray-500 font-medium">Nenhuma atividade recente</p>
                  <Link href="/jobs" className="text-sm text-emerald-600 font-bold underline mt-2 inline-block">Começar a buscar</Link>
                </div>
              ) : (
                data.recentActivity.slice(0, 4).map((item) => (
                  <ActivityCard key={item.id} activity={item} />
                ))
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Urgently Task (Progress) */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                Status do Pipeline
              </h2>
              <div className="bg-white p-6 rounded-3xl border border-emerald-50 shadow-sm hover:shadow-lg hover:shadow-emerald-500/5 transition-all space-y-6">
                <PipelineProgress
                  label={`Candidaturas (${data.overview.applied})`}
                  value={(data.overview.applied / (data.overview.total || 1)) * 100}
                  color="bg-emerald-500"
                />
                <PipelineProgress
                  label={`Entrevistas (${data.overview.interviews})`}
                  value={(data.overview.interviews / (data.overview.total || 1)) * 100}
                  color="bg-emerald-500"
                />
                <PipelineProgress
                  label={`Propostas (${data.overview.offers})`}
                  value={(data.overview.offers / (data.overview.total || 1)) * 100}
                  color="bg-emerald-500"
                />
                <div className="pt-2 flex justify-between text-xs font-bold text-gray-400 px-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* New Chat (Quick Actions) */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                Ações Rápidas
              </h2>
              <div className="bg-white p-2 rounded-3xl border border-emerald-50 shadow-sm space-y-1">
                <Link href="/jobs" className="flex items-center gap-4 p-3 hover:bg-emerald-50 rounded-2xl transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-white group-hover:shadow-md transition-all flex items-center justify-center text-emerald-600">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors">Buscar Vagas</h4>
                    <p className="text-xs text-gray-400">Encontre novas oportunidades</p>
                  </div>
                </Link>

                <Link href="/pipeline" className="flex items-center gap-4 p-3 hover:bg-emerald-50 rounded-2xl transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-white group-hover:shadow-md transition-all flex items-center justify-center text-emerald-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors">Pipeline</h4>
                    <p className="text-xs text-gray-400">Gerencie suas candidaturas</p>
                  </div>
                </Link>

                <Link href="/profile" className="flex items-center gap-4 p-3 hover:bg-emerald-50 rounded-2xl transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-white group-hover:shadow-md transition-all flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors">Perfil</h4>
                    <p className="text-xs text-gray-400">Atualize seu currículo</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
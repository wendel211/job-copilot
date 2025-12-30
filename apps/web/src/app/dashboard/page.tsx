'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
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
} from 'lucide-react';
import Link from 'next/link';

// ============================================================================
// STATS CARD COMPONENT
// ============================================================================
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const StatsCard = ({ title, value, icon, trend, color }: StatsCardProps) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <Card hover>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">{trend}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// ACTIVITY ITEM COMPONENT
// ============================================================================
interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
  type: 'job' | 'email' | 'pipeline';
}

const ActivityItem = ({ title, description, time, type }: ActivityItemProps) => {
  const icons = {
    job: <Briefcase className="w-4 h-4 text-blue-600" />,
    email: <Send className="w-4 h-4 text-green-600" />,
    pipeline: <Calendar className="w-4 h-4 text-purple-600" />,
  };

  return (
    <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="p-2 bg-gray-100 rounded-lg">{icons[type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600 truncate">{description}</p>
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap">{time}</span>
    </div>
  );
};

// ============================================================================
// DASHBOARD PAGE
// ============================================================================
export default function DashboardPage() {
  const { userId } = useAppStore();
  const [stats, setStats] = useState({
    totalJobs: 0,
    applied: 0,
    interviews: 0,
    drafts: 0,
  });

  useEffect(() => {
    // TODO: Buscar dados reais da API
    setStats({
      totalJobs: 42,
      applied: 12,
      interviews: 3,
      drafts: 5,
    });
  }, [userId]);

  return (
    <AppShell>
      <div className="space-y-8 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Bem-vindo de volta! Aqui está um resumo das suas candidaturas.
            </p>
          </div>
          <Link href="/jobs">
            <Button>
              <Plus className="w-4 h-4" />
              Nova Candidatura
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Vagas Salvas"
            value={stats.totalJobs}
            icon={<Briefcase className="w-6 h-6" />}
            trend="+8 esta semana"
            color="blue"
          />
          <StatsCard
            title="Candidaturas Enviadas"
            value={stats.applied}
            icon={<Send className="w-6 h-6" />}
            trend="+3 esta semana"
            color="green"
          />
          <StatsCard
            title="Entrevistas"
            value={stats.interviews}
            icon={<Calendar className="w-6 h-6" />}
            color="purple"
          />
          <StatsCard
            title="Rascunhos"
            value={stats.drafts}
            icon={<TrendingUp className="w-6 h-6" />}
            color="orange"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Atividade Recente
                </h2>
                <Badge variant="blue">{stats.totalJobs} itens</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <ActivityItem
                  title="Nova vaga salva"
                  description="Senior Full Stack Developer - Empresa XYZ"
                  time="2h atrás"
                  type="job"
                />
                <ActivityItem
                  title="Email enviado"
                  description="Candidatura para Backend Engineer"
                  time="5h atrás"
                  type="email"
                />
                <ActivityItem
                  title="Status atualizado"
                  description="DevOps Engineer movido para Entrevista"
                  time="1d atrás"
                  type="pipeline"
                />
                <ActivityItem
                  title="Nova vaga salva"
                  description="React Developer - Startup ABC"
                  time="2d atrás"
                  type="job"
                />
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  href="/pipeline"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  Ver todas as atividades
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                Ações Rápidas
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/jobs">
                  <Button variant="outline" className="w-full justify-start">
                    <Briefcase className="w-4 h-4" />
                    Buscar Vagas
                  </Button>
                </Link>
                <Link href="/pipeline">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4" />
                    Ver Pipeline
                  </Button>
                </Link>
                <Link href="/drafts">
                  <Button variant="outline" className="w-full justify-start">
                    <Send className="w-4 h-4" />
                    Rascunhos ({stats.drafts})
                  </Button>
                </Link>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  💡 Dica do Dia
                </h3>
                <p className="text-sm text-blue-700">
                  Personalize seus emails para cada vaga usando palavras-chave
                  da descrição para aumentar suas chances.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
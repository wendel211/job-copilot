'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { statsApi } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import {
  Send, Calendar, FileText, Clock,
  Loader2, Search, TrendingUp, CheckCircle2,
  ArrowRight, Sparkles, Briefcase, Plus, ChevronRight
} from 'lucide-react';

// ─────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────
interface DashboardData {
  overview: {
    total: number; applied: number; interviews: number;
    offers: number; rejected: number; drafts: number;
  };
  recentActivity: Array<{
    id: string; status: string; updatedAt: string;
    job: { title: string; company: { name: string } };
  }>;
}

// ─────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────
const STATUS: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  discovered: { label: 'Salvo', dot: '#10b981', bg: '#f0fdf4', text: '#065f46' },
  prepared: { label: 'Salvo', dot: '#10b981', bg: '#f0fdf4', text: '#065f46' },
  applied: { label: 'Aplicado', dot: '#3b82f6', bg: '#eff6ff', text: '#1e40af' },
  sent: { label: 'Aplicado', dot: '#3b82f6', bg: '#eff6ff', text: '#1e40af' },
  interview: { label: 'Entrevista', dot: '#8b5cf6', bg: '#f5f3ff', text: '#4c1d95' },
  screening: { label: 'Entrevista', dot: '#8b5cf6', bg: '#f5f3ff', text: '#4c1d95' },
  offer: { label: 'Proposta', dot: '#f59e0b', bg: '#fffbeb', text: '#78350f' },
  rejected: { label: 'Rejeitado', dot: '#ef4444', bg: '#fef2f2', text: '#7f1d1d' },
};
const getStatus = (s: string) =>
  STATUS[s] ?? { label: 'Atualizado', dot: '#94a3b8', bg: '#f8fafc', text: '#334155' };

const AVATAR_PALETTE = [
  { bg: '#ecfdf5', fg: '#059669' }, { bg: '#eff6ff', fg: '#2563eb' },
  { bg: '#f5f3ff', fg: '#7c3aed' }, { bg: '#fff7ed', fg: '#d97706' },
  { bg: '#fdf2f8', fg: '#9d174d' }, { bg: '#f0f9ff', fg: '#0369a1' },
];
const avatarOf = (name = '') => {
  let h = 0; for (const c of name) h += c.charCodeAt(0);
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
};
const initials = (name = '') => name.trim().slice(0, 2).toUpperCase() || '--';

// ─────────────────────────────────────────────────
// HOOK: contador animado
// ─────────────────────────────────────────────────
function useCount(target: number, duration = 900) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!target) { setN(0); return; }
    const t0 = Date.now();
    let raf: number;
    const tick = () => {
      const p = Math.min((Date.now() - t0) / duration, 1);
      const eased = 1 - (1 - p) ** 3;
      setN(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}

// ─────────────────────────────────────────────────
// CARD MÉTRICA
// ─────────────────────────────────────────────────
function MetricCard({
  label, value, total, icon: Icon, color, lightBg, delay = 0,
}: {
  label: string; value: number; total: number;
  icon: React.ElementType; color: string; lightBg: string; delay?: number;
}) {
  const [show, setShow] = useState(false);
  const count = useCount(show ? value : 0);
  useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t); }, [delay]);

  const pct = total ? Math.round((value / total) * 100) : 0;

  return (
    <div
      className="metric-card"
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        opacity: show ? 1 : 0,
        transform: show ? 'none' : 'translateY(12px)',
        transition: 'opacity 0.45s ease, transform 0.45s ease, box-shadow 0.2s',
      }}
    >
      {/* topo: ícone + percentual */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: lightBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={color} strokeWidth={2} />
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, color,
          background: lightBg, padding: '3px 8px', borderRadius: 99,
        }}>{pct}%</span>
      </div>

      {/* número */}
      <div>
        <div style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', lineHeight: 1, letterSpacing: -1 }}>
          {count}
        </div>
        <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginTop: 4 }}>{label}</div>
      </div>

      {/* barra */}
      <div style={{ height: 3, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: show ? `${Math.max(4, pct)}%` : '0%',
          background: color,
          borderRadius: 99,
          transition: 'width 1.1s cubic-bezier(0.22,1,0.36,1)',
        }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// LINHA DE ATIVIDADE
// ─────────────────────────────────────────────────
function ActivityItem({
  item, i,
}: { item: DashboardData['recentActivity'][0]; i: number }) {
  const s = getStatus(item.status);
  const av = avatarOf(item.job.company.name);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80 + i * 60);
    return () => clearTimeout(t);
  }, [i]);

  return (
    <div
      className="activity-row"
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
        borderRadius: 12,
        opacity: show ? 1 : 0,
        transform: show ? 'none' : 'translateY(8px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease, background 0.15s',
        cursor: 'pointer',
      }}
    >
      {/* avatar empresa */}
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: av.bg, color: av.fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 800, letterSpacing: 0.3,
        border: `1px solid ${av.fg}20`,
      }}>
        {initials(item.job.company.name)}
      </div>

      {/* info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 13, fontWeight: 600, color: '#0f172a',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          lineHeight: 1.3, marginBottom: 2,
        }}>
          {item.job.title}
        </p>
        <p style={{ fontSize: 12, color: '#94a3b8' }}>{item.job.company.name}</p>
      </div>

      {/* badge status */}
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 11, fontWeight: 600,
        padding: '4px 10px', borderRadius: 99,
        background: s.bg, color: s.text,
        whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        <span style={{
          width: 5, height: 5, borderRadius: 99,
          background: s.dot, display: 'inline-block',
        }} />
        {s.label}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────
// DONUT MINI
// ─────────────────────────────────────────────────
function FunnelBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 300); return () => clearTimeout(t); }, []);
  const pct = total ? (value / total) * 100 : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 99, background: color }} />
          <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>{label}</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{value}</span>
      </div>
      <div style={{ height: 4, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: show ? `${Math.max(2, pct)}%` : '0%',
          background: color,
          borderRadius: 99,
          transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)',
        }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// AÇÃO RÁPIDA
// ─────────────────────────────────────────────────
function QuickLink({ href, icon: Icon, color, title, sub }: {
  href: string; icon: React.ElementType; color: string; title: string; sub: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="quick-link" style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
        border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff',
        transition: 'all 0.18s ease', cursor: 'pointer',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: color + '15',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={16} color={color} strokeWidth={2} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 1 }}>{title}</p>
          <p style={{ fontSize: 11, color: '#94a3b8' }}>{sub}</p>
        </div>
        <ChevronRight size={14} color="#cbd5e1" />
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, userId } = useAppStore() as { user: any; userId: string };
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    overview: { total: 0, applied: 0, interviews: 0, offers: 0, rejected: 0, drafts: 0 },
    recentActivity: [],
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const firstName = (user?.name || user?.email || 'Candidato').split(/[\s@]/)[0];

  const successRate = data.overview.total > 0
    ? Math.round(((data.overview.interviews + data.overview.offers) / data.overview.total) * 100)
    : 0;

  useEffect(() => {
    if (!userId) return;
    statsApi.getSummary(userId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <AppShell>
      <style>{`
        .metric-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important; transform: translateY(-2px) !important; }
        .activity-row:hover { background: #f8fafc !important; }
        .quick-link:hover { border-color: #10b981 !important; box-shadow: 0 0 0 3px #10b98115 !important; }
        .nova-vaga:hover { background: #059669 !important; box-shadow: 0 4px 14px rgba(16,185,129,0.4) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: 40 }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{
              fontSize: 26, fontWeight: 800, color: '#0f172a',
              margin: 0, letterSpacing: -0.5,
            }}>
              {greeting}, {firstName} 👋
            </h1>
            <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4, fontWeight: 400 }}>
              Acompanhe sua jornada de candidaturas
            </p>
          </div>
          <Link href="/jobs">
            <button
              className="nova-vaga"
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: '#10b981', color: '#fff',
                border: 'none', borderRadius: 12,
                padding: '11px 20px', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
              }}
            >
              <Plus size={17} strokeWidth={2.5} />
              Nova Vaga
            </button>
          </Link>
        </div>

        {/* ── MÉTRICAS ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 14,
        }}>
          <MetricCard label="Candidaturas" value={data.overview.applied} total={data.overview.total} icon={Send} color="#10b981" lightBg="#ecfdf5" delay={0} />
          <MetricCard label="Entrevistas" value={data.overview.interviews} total={data.overview.total} icon={Calendar} color="#3b82f6" lightBg="#eff6ff" delay={60} />
          <MetricCard label="Rascunhos" value={data.overview.drafts} total={data.overview.total} icon={FileText} color="#8b5cf6" lightBg="#f5f3ff" delay={120} />
          <MetricCard label="Em Andamento" value={Math.max(0, data.overview.total - data.overview.rejected)} total={data.overview.total} icon={Clock} color="#f59e0b" lightBg="#fff7ed" delay={180} />
        </div>

        {/* ── LINHA PRINCIPAL ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.8fr) minmax(0,1fr)', gap: 18, alignItems: 'start' }}>

          {/* ATIVIDADE RECENTE */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 20px 14px', borderBottom: '1px solid #f1f5f9',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Briefcase size={15} color="#10b981" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', letterSpacing: 0.2 }}>
                  Atividade Recente
                </span>
              </div>
              <Link href="/pipeline" style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 12, color: '#10b981', fontWeight: 600, textDecoration: 'none',
              }}>
                Ver pipeline <ArrowRight size={12} />
              </Link>
            </div>

            <div style={{ padding: '8px 8px 12px' }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '36px 0' }}>
                  <Loader2 size={24} color="#10b981" style={{ animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : data.recentActivity.length === 0 ? (
                <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                  <Sparkles size={28} color="#cbd5e1" style={{ marginBottom: 10 }} />
                  <p style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginBottom: 6 }}>
                    Nenhuma atividade ainda
                  </p>
                  <Link href="/jobs" style={{ fontSize: 12, color: '#10b981', fontWeight: 700 }}>
                    Buscar vagas →
                  </Link>
                </div>
              ) : (
                data.recentActivity.slice(0, 6).map((item, i) => (
                  <ActivityItem key={item.id} item={item} i={i} />
                ))
              )}
            </div>
          </div>

          {/* COLUNA DIREITA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* FUNIL */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <TrendingUp size={15} color="#10b981" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Funil</span>
                {successRate > 0 && (
                  <span style={{
                    marginLeft: 'auto', fontSize: 11, fontWeight: 700,
                    color: '#10b981', background: '#ecfdf5',
                    padding: '2px 8px', borderRadius: 99,
                  }}>{successRate}% sucesso</span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <FunnelBar label="Candidaturas" value={data.overview.applied} total={data.overview.total} color="#10b981" />
                <FunnelBar label="Entrevistas" value={data.overview.interviews} total={data.overview.total} color="#3b82f6" />
                <FunnelBar label="Propostas" value={data.overview.offers} total={data.overview.total} color="#f59e0b" />
                <FunnelBar label="Rejeitados" value={data.overview.rejected} total={data.overview.total} color="#ef4444" />
              </div>
            </div>

            {/* DICA */}
            <div style={{
              background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
              border: '1px solid #a7f3d0',
              borderRadius: 16, padding: '16px 18px',
            }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <Sparkles size={14} color="#059669" style={{ marginTop: 1, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#065f46' }}>Dica do Copilot</span>
              </div>
              <p style={{ fontSize: 12, color: '#047857', lineHeight: 1.6 }}>
                {data.overview.interviews > 0
                  ? `Você tem ${data.overview.interviews} entrevista${data.overview.interviews > 1 ? 's' : ''} — pesquise a cultura da empresa e prepare perguntas!`
                  : data.overview.applied > 0
                    ? 'Após 5–7 dias sem resposta, envie um follow-up educado. Isso pode triplicar suas chances.'
                    : 'Adicione vagas do seu interesse para começar a acompanhar o progresso da busca.'}
              </p>
            </div>

            {/* AÇÕES RÁPIDAS */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <CheckCircle2 size={14} color="#10b981" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Ações Rápidas</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <QuickLink href="/jobs" icon={Search} color="#3b82f6" title="Buscar Vagas" sub="Encontre oportunidades" />
                <QuickLink href="/pipeline" icon={TrendingUp} color="#8b5cf6" title="Ver Pipeline" sub="Acompanhe candidaturas" />
                <QuickLink href="/settings" icon={CheckCircle2} color="#f59e0b" title="Otimizar Perfil" sub="Atualize seu currículo" />
              </div>
            </div>

          </div>
        </div>

      </div>
    </AppShell>
  );
}
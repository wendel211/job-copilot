'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/Empty';
import {
  Search,
  Plus,
  MapPin,
  Building2,
  ExternalLink,
  Filter,
  X,
  Globe,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { jobsApi, importApi, type Job } from '@/lib/api'; // Removido pipelineApi
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { CreditsModal } from '@/components/credits/CreditsModal';


// ============================================================================
// 1. COMPONENT: JOB CARD (Sem botão de salvar)
// ============================================================================
interface JobCardProps extends Job { }

const JobCard = ({ ...job }: JobCardProps) => {
  // Mapa de cores
  const sourceColors: Record<string, "default" | "success" | "warning" | "danger" | "blue" | "purple"> = {
    greenhouse: 'success',
    lever: 'blue',
    workday: 'purple',
    gupy: 'blue',
    adzuna: 'warning',
    remotive: 'purple',
    programathor: 'danger',
    manual: 'default',
  };

  const displaySource = job.atsType === 'unknown' ? job.sourceType : job.atsType;
  const badgeVariant = sourceColors[displaySource] || 'default';

  return (
    <Card hover className="transition-all duration-200 group relative h-full flex flex-col hover:shadow-lg hover:border-blue-200">
      <CardContent className="p-6 flex-1 flex flex-col">
        {/* Link Principal que cobre o card inteiro */}
        <Link href={`/jobs/${job.id}`} className="absolute inset-0 z-0" aria-label={`Ver detalhes de ${job.title}`} />

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Badge da Fonte & Empresa */}
            <div className="flex items-center gap-2 mb-2">
              <div className="uppercase text-[10px] tracking-wider relative z-10">
                <Badge variant={badgeVariant}>
                  {displaySource}
                </Badge>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 truncate">
                <Building2 className="w-3 h-3 text-gray-400" />
                <span className="truncate">{job.company.name}</span>
              </div>
            </div>

            {/* Título */}
            <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
              {job.title}
            </h3>

            {/* Localização */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {job.location || 'Localização não especificada'}
              </span>
              {job.remote && (
                <span className="flex items-center gap-1 text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">
                  <Globe className="w-3 h-3" /> Remoto
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Descrição Curta */}
        <p className="text-xs text-gray-500 line-clamp-3 mb-4 flex-1">
          {job.description.replace(/<[^>]*>?/gm, '')}
        </p>

        {/* Footer: Data e Link Externo */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 mt-auto relative z-10">
          <span>{new Date(job.createdAt).toLocaleDateString()}</span>

          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-blue-600 font-medium transition-colors"
            onClick={(e) => e.stopPropagation()} // Impede que o clique abra o detalhe interno
          >
            Ver original <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 2. COMPONENT: RECOMMENDED SECTION
// ============================================================================
const RecommendedSection = ({ jobs }: { jobs: Job[] }) => {
  if (!jobs.length) return null;

  return (
    <div className="mb-10 animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center gap-2 mb-4 px-1">
        <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
        <h2 className="text-xl font-bold text-gray-900">Sugestões para seu perfil</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {jobs.slice(0, 3).map(job => (
          <div key={job.id} className="relative group">
            {/* Efeito de Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-200 to-orange-100 rounded-xl opacity-50 group-hover:opacity-100 transition duration-500 blur-sm"></div>

            <div className="relative bg-white rounded-xl p-0 h-full border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
              <JobCard {...job} />
              <div className="absolute top-0 right-0 p-2 shadow-sm z-10">
                <Badge variant="warning">Top Match</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 3. COMPONENT: IMPORT MODAL
// ============================================================================
const ImportModal = ({ isOpen, onClose, onImport, isLoading }: any) => {
  const [url, setUrl] = useState('');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl relative z-50">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Importar Vaga</h2>
            <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Cole o link da vaga (LinkedIn, Gupy, Greenhouse) para adicionar ao sistema manualmente.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); onImport(url); }} className="space-y-4">
            <div>
              <Input
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!url.trim() || isLoading}>
                {isLoading ? 'Importando...' : 'Importar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};



// ... (existing imports)

// ============================================================================
// 4. MAIN PAGE
// ============================================================================
export default function JobsPage() {
  const { userId } = useAppStore();

  // -- Data State --
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recommended, setRecommended] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // -- Pagination State --
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // -- Filters State --
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    remote: false,
    atsType: '' as string,
    source: '' as string,
  });

  // -- Actions State --
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // 1. Fetch Recommendations (Once on mount)
  useEffect(() => {
    jobsApi.getRecommendations().then(setRecommended).catch(console.error);
  }, []);

  // 2. Fetch Jobs (Main List)
  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await jobsApi.search({
        page,
        q: searchQuery,
        remote: filters.remote ? true : undefined,
        atsType: filters.atsType || undefined,
        source: filters.source || undefined,
        take: 24
      });

      setJobs(response.data);
      if (response.meta) {
        setTotalPages(response.meta.lastPage);
        setTotalItems(response.meta.total);
      }
    } catch (error) {
      console.error('Erro ao buscar:', error);
      toast.error('Erro ao carregar vagas.');
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, filters]);

  // Debounce e Efeitos
  useEffect(() => {
    const timeoutId = setTimeout(fetchJobs, 500);
    return () => clearTimeout(timeoutId);
  }, [fetchJobs]);

  // Resetar página ao filtrar
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filters]);

  // Ações
  const handleImport = async (url: string) => {
    try {
      setIsImporting(true);
      const { job } = await importApi.importFromLink(url, userId);
      setJobs((prev) => [job, ...prev]);
      setShowImportModal(false);
      toast.success('Vaga importada com sucesso!');
    } catch (error: any) {
      // Tratar erro de créditos insuficientes
      if (error.response?.status === 400 && error.response?.data?.message?.includes('créditos')) {
        toast.error('Você não tem créditos suficientes para importar esta vaga.');
        setShowImportModal(false); // Fecha o modal de importação
        setShowCreditsModal(true); // Abre o modal de compra
      } else {
        toast.error('Falha ao importar. Link inválido ou não suportado.');
      }
    } finally {
      setIsImporting(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({ remote: false, atsType: '', source: '' });
  };

  const hasActiveFilters = searchQuery || filters.remote || filters.atsType || filters.source;

  return (
    <AppShell>
      <div className="space-y-8 animate-slide-in pb-20">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Vagas</h1>
            <p className="text-gray-500 mt-1">
              {totalItems} oportunidades encontradas em nossa base.
            </p>
          </div>
          <Button onClick={() => setShowImportModal(true)} className="shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Importar Vaga Manual
          </Button>
        </div>

        {/* Recomendações */}
        {!hasActiveFilters && page === 1 && (
          <RecommendedSection jobs={recommended} />
        )}

        {/* Barra de Filtros */}
        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por cargo, tecnologia (ex: React) ou empresa..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  variant={showFilters ? "secondary" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                  className="min-w-[100px]"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </div>

              {/* Área de Filtros Expansível */}
              {showFilters && (
                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100 animate-in slide-in-from-top-2">

                  {/* Filtro: Fonte */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Origem</label>
                    <select
                      className="h-9 px-3 text-sm bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                      value={filters.source}
                      onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                    >
                      <option value="">Todas as Fontes</option>
                      <optgroup label="Agregadores">
                        <option value="adzuna">Adzuna</option>
                        <option value="remotive">Remotive</option>
                        <option value="programathor">Programathor</option>
                      </optgroup>
                      <optgroup label="Manual / ATS">
                        <option value="manual">Manual</option>
                        <option value="linkedin">LinkedIn</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* Filtro: ATS */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Plataforma</label>
                    <select
                      className="h-9 px-3 text-sm bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                      value={filters.atsType}
                      onChange={(e) => setFilters(prev => ({ ...prev, atsType: e.target.value }))}
                    >
                      <option value="">Qualquer ATS</option>
                      <option value="greenhouse">Greenhouse</option>
                      <option value="lever">Lever</option>
                      <option value="gupy">Gupy</option>
                      <option value="workday">Workday</option>
                    </select>
                  </div>

                  {/* Filtro: Remoto */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Local</label>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, remote: !prev.remote }))}
                      className={`h-9 px-4 text-sm border rounded-md flex items-center gap-2 transition-colors ${filters.remote
                        ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <Globe className="w-4 h-4" />
                      Apenas Remoto
                    </button>
                  </div>

                  {/* Botão Limpar */}
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="ml-auto text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium mt-auto mb-2"
                    >
                      <X className="w-3 h-3" /> Limpar filtros
                    </button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Grid de Vagas */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <LoadingSpinner size="lg" />
              <p className="text-gray-500 text-sm animate-pulse">Buscando oportunidades...</p>
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={<Search className="w-12 h-12 text-gray-300" />}
              title="Nenhuma vaga encontrada"
              description="Tente ajustar seus filtros ou importe uma nova vaga."
              action={
                hasActiveFilters
                  ? <Button variant="outline" onClick={clearFilters}>Limpar Filtros</Button>
                  : <Button onClick={() => setShowImportModal(true)}>Importar Agora</Button>
              }
            />
          ) : (
            <>
              {/* GRID COM MAIS ESPAÇO (5 colunas em telas grandes) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    {...job}
                  />
                ))}
              </div>

              {/* Paginação */}
              <div className="flex items-center justify-between mt-8 border-t pt-4 border-gray-100">
                <p className="text-sm text-gray-500">
                  Página {page} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Próxima <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        isLoading={isImporting}
      />

      <CreditsModal
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
        title="Créditos Insuficientes"
        description="Para importar novas vagas com nossa IA, você precisa adquirir créditos."
      />
    </AppShell>
  );
}
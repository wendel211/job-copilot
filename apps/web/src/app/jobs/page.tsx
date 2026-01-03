'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link'; // Importante para a navegação interna
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
  Bookmark,
  Filter,
  X,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { jobsApi, pipelineApi, importApi, type Job } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

// ============================================================================
// JOB CARD COMPONENT (Atualizado com Navegação)
// ============================================================================
interface JobCardProps extends Job {
  onSave: (jobId: string) => void;
  isSaving: boolean;
}

const JobCard = ({ onSave, isSaving, ...job }: JobCardProps) => {
  const atsColors = {
    greenhouse: 'success',
    lever: 'blue',
    workday: 'purple',
    gupy: 'warning',
    unknown: 'default',
  } as const;

  const atsColor = atsColors[job.atsType as keyof typeof atsColors] || 'default';

  return (
    <Card hover className="transition-all duration-200 group relative">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Company & ATS */}
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={atsColor}>
                {job.atsType.toUpperCase()}
              </Badge>
              <span className="text-sm text-gray-300">|</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <Building2 className="w-4 h-4 text-gray-400" />
                {job.company.name}
              </div>
            </div>

            {/* Title - Link Principal (Cobre o Card via absolute inset-0) */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              <Link href={`/jobs/${job.id}`} className="focus:outline-none">
                {/* Este span faz o card inteiro ser clicável, exceto os botões com z-index maior */}
                <span className="absolute inset-0" aria-hidden="true" />
                {job.title}
              </Link>
            </h3>

            {/* Location & Remote */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                {job.location || 'Localização não especificada'}
              </div>
              {job.remote && (
                <div className="flex items-center gap-1">
                  <Badge variant="success" size="sm">
                    <Globe className="w-3 h-3" />
                    Remoto
                  </Badge>
                </div>
              )}
            </div>

            {/* Description Preview */}
            <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
              {job.description}
            </p>

            {/* Actions - Link Externo (z-10 para ficar acima do link do card) */}
            <div className="flex items-center gap-3 pt-2 relative z-10">
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                onClick={(e) => e.stopPropagation()} // Impede abrir o detalhe ao clicar aqui
              >
                Ver vaga original
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Save Button (z-10 para ficar acima do link do card) */}
          <div className="relative z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Impede abrir o detalhe ao clicar em salvar
                onSave(job.id);
              }}
              disabled={isSaving}
              className={isSaving ? 'opacity-100' : ''}
            >
              {isSaving ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Bookmark className="w-4 h-4 text-gray-500" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// IMPORT MODAL
// ============================================================================
const ImportModal = ({ isOpen, onClose, onImport, isLoading }: any) => {
  const [url, setUrl] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <Card className="w-full max-w-md shadow-2xl relative z-50">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Importar Vaga</h2>
          <p className="text-sm text-gray-500 mb-4">
            Cole o link da vaga para adicionar ao sistema.
          </p>
          
          <form onSubmit={(e) => { e.preventDefault(); onImport(url); }} className="space-y-4">
            <div>
              <Input
                placeholder="https://boards.greenhouse.io/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-400 mt-2">
                Suportamos: Greenhouse, Lever, Workday, Gupy
              </p>
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


export default function JobsPage() {
  const { userId } = useAppStore();
  
  // Data State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    remote: false,
    atsType: '' as string,
  });

  // Actions State
  const [showImportModal, setShowImportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Busca Principal
  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await jobsApi.search({ 
        q: searchQuery,
        remote: filters.remote ? true : undefined,
        atsType: filters.atsType || undefined,
        take: 50 
      });
      setJobs(data);
    } catch (error) {
      console.error('Erro ao buscar:', error);
      toast.error('Erro ao carregar vagas. Verifique a conexão.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filters]);

  // Carregar inicial e quando filtros mudam
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchJobs();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [fetchJobs]);

  const handleImport = async (url: string) => {
    try {
      setIsImporting(true);
      const { job } = await importApi.importFromLink(url, userId);
      setJobs((prev) => [job, ...prev]);
      setShowImportModal(false);
      toast.success('Vaga importada com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Falha ao importar. Verifique o link.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleSave = async (jobId: string) => {
    try {
      setSavingId(jobId);
      await pipelineApi.create(userId, jobId);
      toast.success('Vaga salva no Pipeline!', {
        icon: <CheckCircle2 className="w-4 h-4 text-green-500" />
      });
    } catch (error) {
      toast.error('Erro ao salvar vaga.');
    } finally {
      setSavingId(null);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({ remote: false, atsType: '' });
  };

  const hasActiveFilters = searchQuery || filters.remote || filters.atsType;

  return (
    <AppShell>
      <div className="space-y-6 animate-slide-in pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Vagas</h1>
            <p className="text-gray-500 mt-1">
              Busque em nossa base ou importe diretamente do LinkedIn/ATS.
            </p>
          </div>
          <Button onClick={() => setShowImportModal(true)} className="shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Importar Vaga
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              
              {/* Top Row: Search Input + Toggle Filters */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Buscar por cargo, empresa ou tecnologia..."
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

              {/* Filters Row (Collapsible) */}
              {showFilters && (
                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100 animate-in slide-in-from-top-2">
                  
                  {/* ATS Filter */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Plataforma</label>
                    <select 
                      className="h-9 px-3 text-sm bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                      value={filters.atsType}
                      onChange={(e) => setFilters(prev => ({ ...prev, atsType: e.target.value }))}
                    >
                      <option value="">Todas</option>
                      <option value="greenhouse">Greenhouse</option>
                      <option value="lever">Lever</option>
                      <option value="workday">Workday</option>
                      <option value="gupy">Gupy</option>
                    </select>
                  </div>

                  {/* Remote Filter */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Modalidade</label>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, remote: !prev.remote }))}
                      className={`h-9 px-4 text-sm border rounded-md flex items-center gap-2 transition-colors ${
                        filters.remote 
                          ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' 
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      Apenas Remoto
                    </button>
                  </div>

                  {/* Clear Button */}
                  {hasActiveFilters && (
                    <button 
                      onClick={clearFilters}
                      className="ml-auto text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"
                    >
                      <X className="w-3 h-3" />
                      Limpar filtros
                    </button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Grid */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <LoadingSpinner size="lg" />
              <p className="text-gray-500 text-sm animate-pulse">Buscando as melhores oportunidades...</p>
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={<Search className="w-12 h-12 text-gray-300" />}
              title="Nenhuma vaga encontrada"
              description={
                hasActiveFilters 
                  ? "Tente ajustar seus filtros de busca para ver mais resultados."
                  : "Nenhuma vaga na base de dados. Tente importar uma nova vaga!"
              }
              action={
                hasActiveFilters ? (
                  <Button variant="outline" onClick={clearFilters}>Limpar Filtros</Button>
                ) : (
                  <Button onClick={() => setShowImportModal(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Importar Primeira Vaga
                  </Button>
                )
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  {...job}
                  onSave={handleSave}
                  isSaving={savingId === job.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ImportModal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        isLoading={isImporting}
      />
    </AppShell>
  );
}
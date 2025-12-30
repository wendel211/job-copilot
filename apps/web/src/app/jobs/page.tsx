'use client';

import React, { useState, useEffect } from 'react';
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
  Briefcase,
  Building2,
  ExternalLink,
  Bookmark,
  Filter,
} from 'lucide-react';
import { jobsApi, pipelineApi, importApi, type Job } from '@/lib/api';
import { useAppStore } from '@/lib/store';

// ============================================================================
// JOB CARD COMPONENT
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

  return (
    <Card hover className="transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Company & ATS */}
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={atsColors[job.atsType as keyof typeof atsColors]}>
                {job.atsType.toUpperCase()}
              </Badge>
              <span className="text-sm text-gray-600">•</span>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Building2 className="w-4 h-4" />
                {job.company.name}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
              {job.title}
            </h3>

            {/* Location & Remote */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.location || 'Não especificado'}
              </div>
              {job.remote && (
                <Badge variant="blue" size="sm">
                  Remoto
                </Badge>
              )}
            </div>

            {/* Description Preview */}
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
              {job.description.substring(0, 200)}...
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                Ver vaga
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Save Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSave(job.id)}
            disabled={isSaving}
            isLoading={isSaving}
          >
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// IMPORT MODAL COMPONENT
// ============================================================================
interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (url: string) => void;
  isLoading: boolean;
}

const ImportModal = ({ isOpen, onClose, onImport, isLoading }: ImportModalProps) => {
  const [url, setUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onImport(url.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-slide-in">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Importar Vaga por Link
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="URL da Vaga"
              placeholder="https://boards.greenhouse.io/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-sm text-gray-600">
              Suportamos: Greenhouse, Lever, Workday, Gupy
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!url.trim() || isLoading}
                isLoading={isLoading}
                className="flex-1"
              >
                Importar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// JOBS PAGE
// ============================================================================
export default function JobsPage() {
  const { userId } = useAppStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [savingJobId, setSavingJobId] = useState<string | null>(null);

  // Load jobs
  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      const data = await jobsApi.search({ take: 20 });
      setJobs(data);
    } catch (error) {
      console.error('Erro ao carregar vagas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const data = await jobsApi.search({ q: searchQuery, take: 20 });
      setJobs(data);
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (url: string) => {
    try {
      setIsImporting(true);
      const { job } = await importApi.importFromLink(url, userId);
      setJobs((prev) => [job, ...prev]);
      setShowImportModal(false);
      alert('Vaga importada com sucesso!');
    } catch (error) {
      console.error('Erro ao importar:', error);
      alert('Erro ao importar vaga. Verifique a URL.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleSaveJob = async (jobId: string) => {
    try {
      setSavingJobId(jobId);
      await pipelineApi.create(userId, jobId);
      alert('Vaga salva no pipeline!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar vaga.');
    } finally {
      setSavingJobId(null);
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-6 animate-slide-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vagas</h1>
            <p className="text-gray-600 mt-1">
              Busque e salve vagas de diversos ATS
            </p>
          </div>
          <Button onClick={() => setShowImportModal(true)}>
            <Plus className="w-4 h-4" />
            Importar Vaga
          </Button>
        </div>

        {/* Search & Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por título ou empresa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  icon={<Search className="w-4 h-4" />}
                />
              </div>
              <Button onClick={handleSearch} variant="secondary">
                <Search className="w-4 h-4" />
                Buscar
              </Button>
              <Button variant="outline">
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {filteredJobs.length} vagas encontradas
            </p>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : filteredJobs.length === 0 ? (
            <EmptyState
              icon={<Briefcase className="w-12 h-12" />}
              title="Nenhuma vaga encontrada"
              description="Tente ajustar os filtros ou importe uma nova vaga"
              action={
                <Button onClick={() => setShowImportModal(true)}>
                  <Plus className="w-4 h-4" />
                  Importar Vaga
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  {...job}
                  onSave={handleSaveJob}
                  isSaving={savingJobId === job.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        isLoading={isImporting}
      />
    </AppShell>
  );
}
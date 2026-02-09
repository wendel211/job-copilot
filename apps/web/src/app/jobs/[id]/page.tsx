'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { jobsService, JobDetails } from '@/services/jobs-service';
import { JobCopilot } from '@/components/jobs/JobCopilot';
import { JobDescriptionEditor } from '@/components/jobs/JobDescriptionEditor';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';
import { MapPin, Building2, Calendar, ExternalLink, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function JobDetailsPage() {
  const params = useParams();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJob() {
      if (!params.id) return;
      try {
        const data = await jobsService.getById(params.id as string);
        setJob(data);
      } catch (error) {
        console.error(error);
        toast.error('Erro ao carregar detalhes da vaga');
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [params.id]);

  // Handler para quando o JobCopilot atualizar o job (ex: salvar descrição)
  const handleJobUpdate = (updatedJob: any) => {
    setJob(prev => prev ? { ...prev, ...updatedJob } : prev);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (!job) return (
    <div className="flex h-screen items-center justify-center flex-col gap-4">
      <p className="text-gray-500">Vaga não encontrada.</p>
      <Link href="/jobs">
        <Button variant="outline">Voltar para lista</Button>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-8 animate-fade-in">
      <div className="container mx-auto max-w-6xl px-6">

        {/* Breadcrumb / Voltar */}
        <Link
          href="/jobs"
          className="mb-8 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para vagas
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">

          {/* === COLUNA DA ESQUERDA (Detalhes) === */}
          <div className="lg:col-span-2 space-y-8">

            {/* Cabeçalho da Vaga */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">
                  {job.title}
                </h1>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-gray-900">{job.company.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                      <MapPin className="h-4 w-4" />
                    </div>
                    {job.location || 'Localização não informada'} {job.remote && '(Remoto)'}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                      <Calendar className="h-4 w-4" />
                    </div>
                    Publicada {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true, locale: ptBR })}
                  </div>
                </div>
              </div>
            </div>

            {/* Descrição da Vaga (Editável uma vez) */}
            <JobDescriptionEditor
              jobId={job.id}
              initialDescription={job.description}
              descriptionEditedAt={job.descriptionEditedAt}
              onDescriptionUpdate={(newDesc) => handleJobUpdate({ description: newDesc, descriptionEditedAt: new Date().toISOString() })}
            />

            {/* Link para ver vaga original */}
            <div className="flex justify-start">
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button variant="outline" className="gap-2 text-gray-600 border-gray-300 hover:bg-gray-50">
                  Ver vaga original no site da empresa <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>

          {/* === COLUNA DA DIREITA (Ações Inteligentes) === */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <JobCopilot job={job} onJobUpdate={handleJobUpdate} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

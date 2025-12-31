'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { jobsService, JobDetails } from '@/services/jobs-service';
// Certifique-se de que o caminho do import abaixo está correto conforme onde você criou o componente
import { JobCopilot } from '@/components/jobs/JobCopilot'; 
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

  // 1. Busca os dados da vaga ao carregar
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

  // 2. Estado de Carregamento
  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );

  // 3. Estado de Erro / Não encontrado
  if (!job) return (
    <div className="flex h-screen items-center justify-center flex-col gap-4">
      <p className="text-gray-500">Vaga não encontrada.</p>
      <Link href="/jobs">
        <Button variant="outline">Voltar para lista</Button>
      </Link>
    </div>
  );

  // 4. Layout Principal
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-8">
      <div className="container mx-auto max-w-6xl px-6">
        
        {/* Botão Voltar */}
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
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">
                {job.title}
              </h1>
              
              <div className="mt-6 flex flex-wrap gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{job.company.name}</span>
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
                  {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true, locale: ptBR })}
                </div>
              </div>
            </div>

            {/* Descrição da Vaga */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">Sobre a vaga</h3>
              
              {/* Renderiza o HTML vindo do Crawler */}
              <div 
                dangerouslySetInnerHTML={{ __html: job.description }} 
                className="prose prose-blue max-w-none text-gray-600 leading-relaxed text-sm whitespace-pre-line" 
              />
              
              <div className="mt-8 pt-6 border-t flex justify-start">
                <a 
                  href={job.applyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button variant="outline" className="gap-2">
                    Ver vaga no site da empresa <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* === COLUNA DA DIREITA (Copilot) === */}
          <div className="lg:col-span-1">
            {/* Aqui usamos o componente separado */}
            <JobCopilot job={job} />
          </div>

        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Sparkles,
  Bookmark,
  Check,
  ExternalLink,
  Lock,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { pipelineApi, jobsApi } from '@/lib/api';
import { useAppStore } from '@/lib/store';

interface JobCopilotProps {
  job: {
    id: string;
    title: string;
    description: string;
    applyUrl: string;
    descriptionEditedAt?: string | null;
    descriptionSource?: 'auto' | 'manual';
    [key: string]: any;
  };
  onJobUpdate?: (updatedJob: any) => void;
}

export function JobCopilot({ job, onJobUpdate }: JobCopilotProps) {
  const { userId } = useAppStore();

  // Estados de Controle
  const [isLoading, setIsLoading] = useState(false);
  const [savedJobId, setSavedJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<'none' | 'saved' | 'applied'>('none');

  // Verificar se a descrição já foi editada
  const hasDescription = job.description && job.description.length > 50;

  // 1. Verifica status inicial
  useEffect(() => {
    let isMounted = true;

    async function checkStatus() {
      if (!job?.id || !userId) return;

      try {
        const saved = await pipelineApi.checkStatus(userId, job.id);

        if (isMounted) {
          if (saved) {
            setSavedJobId(saved.id);
            const appliedStatuses = ['applied', 'sent', 'screening', 'interview', 'offer', 'rejected', 'closed'];
            if (appliedStatuses.includes(saved.status)) {
              setStatus('applied');
            } else {
              setStatus('saved');
            }
          } else {
            setSavedJobId(null);
            setStatus('none');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    }

    checkStatus();
    return () => { isMounted = false; };
  }, [job.id, userId]);

  // --- LÓGICA DE TOGGLE (SALVAR / DESALVAR) ---
  const handleToggleSave = async () => {
    if (!userId) return;
    setIsLoading(true);

    try {
      if ((status === 'saved' || status === 'applied') && savedJobId) {
        if (status === 'applied' && !confirm('Remover desta vaga do seu pipeline? Isso apagará o status "Aplicado".')) {
          setIsLoading(false);
          return;
        }

        await pipelineApi.delete(savedJobId);
        setSavedJobId(null);
        setStatus('none');
        toast.info('Vaga removida do pipeline.');
      } else {
        const saved = await pipelineApi.create(userId, job.id);
        setSavedJobId(saved.id);
        setStatus('saved');
        toast.success('Vaga salva em "Pipeline"!');
      }
    } catch (error) {
      toast.error('Erro ao atualizar status.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- LÓGICA DE MARCAR COMO APLICADO ---
  const handleMarkAsApplied = async () => {
    if (!userId) return;
    setIsLoading(true);

    try {
      let currentSavedId = savedJobId;
      if (!currentSavedId) {
        const saved = await pipelineApi.create(userId, job.id);
        currentSavedId = saved.id;
        setSavedJobId(saved.id);
      }

      await pipelineApi.updateStatus(currentSavedId, 'applied');
      setStatus('applied');
      toast.success('Vaga marcada como "Candidatura Enviada"!');
    } catch (error) {
      toast.error('Erro ao processar candidatura.');
    } finally {
      setIsLoading(false);
    }
  };

  // Abre o link original da vaga
  const handleOpenJobLink = () => {
    if (job.applyUrl) {
      window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('Link da vaga não disponível');
    }
  };

  // Navegar para página de análise ATS
  const handleOpenAnalysis = () => {
    window.location.href = `/jobs/${job.id}/analysis`;
  };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* HEADER + AÇÕES */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-col gap-4 mb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Job Copilot
            </h2>
            <p className="text-sm text-gray-500">Workspace inteligente para sua candidatura.</p>
          </div>

          <div className="flex flex-col gap-3">
            {/* Status da Descrição */}
            {!hasDescription ? (
              <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-100 flex items-start gap-2">
                <FileText className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Adicione a descrição da vaga (ao lado) para liberar o ATS Scanner.</span>
              </div>
            ) : (
              <div className="p-3 bg-purple-50 text-purple-800 text-xs rounded-lg border border-purple-100 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Descrição adicionada. ATS Scanner liberado!</span>
              </div>
            )}

            {/* Botão ATS Scanner - Habilitado apenas se tem descrição */}
            <Button
              onClick={handleOpenAnalysis}
              disabled={!hasDescription}
              className={`w-full text-white shadow-lg transition-all hover:scale-[1.02] ${hasDescription
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-200'
                  : 'bg-gray-300 cursor-not-allowed shadow-none'
                }`}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Rodar ATS Scanner
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={handleOpenJobLink} className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver Vaga
              </Button>

              <Button
                variant="ghost"
                onClick={handleToggleSave}
                disabled={isLoading}
                className={`w-full ${status === 'saved' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Bookmark className={`w-4 h-4 mr-2 ${status === 'saved' ? 'fill-blue-600' : ''}`} />
                {status === 'saved' ? 'Salvo' : status === 'applied' ? 'Pipeline' : 'Salvar'}
              </Button>
            </div>

            {status !== 'applied' && (
              <Button
                variant="ghost"
                onClick={handleMarkAsApplied}
                disabled={isLoading}
                className="w-full text-emerald-600 hover:bg-emerald-50"
              >
                <Check className="w-4 h-4 mr-2" />
                Já Apliquei
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
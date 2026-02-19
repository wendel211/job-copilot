'use client';

import { useState, useEffect } from 'react';


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
    <div className="space-y-4 animate-fade-in">

      {/* CARD PRINCIPAL */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

        {/* Header do Card */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 leading-tight">Job Copilot</h2>
            <p className="text-xs text-gray-400">Workspace inteligente para candidatura</p>
          </div>
        </div>

        {/* Corpo */}
        <div className="p-5 flex flex-col gap-3">

          {/* Status da Descrição */}
          {!hasDescription ? (
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <FileText className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-snug">
                Adicione a descrição da vaga para liberar o <span className="font-semibold">ATS Scanner</span>.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-white" />
              </div>
              <p className="text-xs text-emerald-700 font-medium">
                Descrição adicionada. ATS Scanner liberado!
              </p>
            </div>
          )}

          {/* Botão ATS Scanner */}
          <button
            onClick={handleOpenAnalysis}
            disabled={!hasDescription}
            className={`
              w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
              text-sm font-semibold transition-all duration-200
              ${hasDescription
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-200/50 hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg hover:shadow-emerald-200/60 hover:scale-[1.02] active:scale-[0.99]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <Sparkles className="w-4 h-4" />
            Analisar com ATS Scanner
          </button>

          {/* Divisor */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          {/* Ações secundárias */}
          <div className="grid grid-cols-2 gap-2">
            {/* Ver Vaga */}
            <button
              onClick={handleOpenJobLink}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-gray-200 text-gray-600 text-xs font-medium hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver Vaga
            </button>

            {/* Salvar / Pipeline */}
            <button
              onClick={handleToggleSave}
              disabled={isLoading}
              className={`
                flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-medium transition-all
                ${status === 'saved'
                  ? 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100'
                  : status === 'applied'
                    ? 'bg-violet-50 text-violet-600 border border-violet-100 hover:bg-violet-100'
                    : 'border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Bookmark className={`w-3.5 h-3.5 ${status === 'saved' ? 'fill-blue-600' : status === 'applied' ? 'fill-violet-600' : ''}`} />
              {status === 'saved' ? 'Salvo' : status === 'applied' ? 'Pipeline' : 'Salvar'}
            </button>
          </div>

          {/* Já Apliquei */}
          {status !== 'applied' && (
            <button
              onClick={handleMarkAsApplied}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 hover:border-emerald-300 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              Já Apliquei
            </button>
          )}

          {/* Badge de status quando já aplicado */}
          {status === 'applied' && (
            <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700">Candidatura registrada</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
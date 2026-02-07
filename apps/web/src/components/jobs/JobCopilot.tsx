'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Mail,
  Sparkles,
  Send,
  Bookmark,
  Loader2,
  ArrowRight,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Job, pipelineApi, userApi } from '@/lib/api';
import { useAppStore } from '@/lib/store';

interface JobCopilotProps {
  job: Job;
}

interface UserProfile {
  skills: string[];
  headline: string;
  bio: string;
}

const TECH_KEYWORDS = [
  'react', 'vue', 'angular', 'typescript', 'javascript', 'java', 'python', 'c#',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'graphql', 'rest', 'node.js',
  'nestjs', 'next.js', 'postgresql', 'mongodb', 'mysql', 'redis', 'tailwindcss',
  'sass', 'figma', 'git', 'ci/cd', 'terraform'
];

export function JobCopilot({ job }: JobCopilotProps) {
  const { userId } = useAppStore();

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>({ skills: [], headline: '', bio: '' });

  // Estados de Texto
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Estados de Controle
  const [isLoading, setIsLoading] = useState(false);
  const [savedJobId, setSavedJobId] = useState<string | null>(null); // ID para poder deletar
  const [status, setStatus] = useState<'none' | 'saved' | 'applied'>('none');

  // 0. Load user profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await userApi.getProfile();
        setUserProfile({
          skills: data.skills || [],
          headline: data.headline || '',
          bio: data.bio || '',
        });
      } catch (error) {
        console.error('Failed to load user profile for match calculation');
      }
    }
    loadProfile();
  }, []);

  // 1. Verifica status inicial (Simulação - ideal seria a API retornar isso na busca)
  useEffect(() => {
    // Resetar estados ao mudar de vaga
    setSavedJobId(null);
    setStatus('none');
  }, [job.id]);

  // 2. Análise de Match (usando profile real)
  const matchAnalysis = useMemo(() => {
    if (!job?.description) return { found: [], missing: [], score: 0 };
    const descriptionLower = job.description.toLowerCase();
    const titleLower = job.title?.toLowerCase() || '';

    // Skills do usuário (lowercase para comparação)
    const userSkillsLower = userProfile.skills.map(s => s.toLowerCase());

    // Skills detectadas na vaga
    const skillsInJob = TECH_KEYWORDS.filter(tech => descriptionLower.includes(tech.toLowerCase()));

    // Skills que o usuário tem e a vaga pede
    const found = skillsInJob.filter(skill => userSkillsLower.includes(skill.toLowerCase()));
    const missing = skillsInJob.filter(skill => !userSkillsLower.includes(skill.toLowerCase()));

    // Base score: % de skills da vaga que o usuário tem
    let score = skillsInJob.length > 0
      ? Math.round((found.length / skillsInJob.length) * 100)
      : 50;

    // Bonus: Headline match (se o cargo do usuário aparece no título da vaga)
    if (userProfile.headline) {
      const headlineWords = userProfile.headline.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const headlineMatch = headlineWords.some(word => titleLower.includes(word) || descriptionLower.includes(word));
      if (headlineMatch) {
        score = Math.min(100, score + 10); // +10% bonus
      }
    }

    return { found, missing, score };
  }, [job, userProfile]);

  // 3. Gerar Template
  useEffect(() => {
    if (job) {
      const subject = `Candidatura para ${job.title} - [Seu Nome]`;
      const body = `Olá, time de recrutamento da ${job.company.name}.\n\nMe chamo [Seu Nome] e estou muito interessado na vaga de ${job.title}.\n\nTenho experiência sólida com as tecnologias que vocês buscam:\n${matchAnalysis.found.length > 0 ? matchAnalysis.found.map(s => `- ${s.charAt(0).toUpperCase() + s.slice(1)}`).join('\n') : '- React e Ecossistema Web'}\n\nFico à disposição.\n\nAtenciosamente,\n[Seu Nome]`;
      setEmailSubject(subject);
      setEmailBody(body);
    }
  }, [job, matchAnalysis]);

  // --- LÓGICA DE TOGGLE (SALVAR / DESALVAR) ---
  const handleToggleSave = async () => {
    if (!userId) return;
    setIsLoading(true);

    try {
      if (status === 'saved' && savedJobId) {
        // DESALVAR (Remover do pipeline)
        await pipelineApi.delete(savedJobId);
        setSavedJobId(null);
        setStatus('none');
        toast.info('Vaga removida do pipeline.');
      } else {
        // SALVAR
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

  // --- LÓGICA DE APLICAR ---
  const handleSendEmail = async () => {
    if (!userId) return;
    setIsLoading(true);

    try {
      // 1. Se não tá salvo, cria. Se tá salvo, usa o ID existente.
      let currentSavedId = savedJobId;
      if (!currentSavedId) {
        const saved = await pipelineApi.create(userId, job.id);
        currentSavedId = saved.id;
        setSavedJobId(saved.id);
      }

      // 2. Simula envio (aqui entraria sua API de email real)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. Move para Applied
      await pipelineApi.updateStatus(currentSavedId, 'applied');

      setStatus('applied');
      toast.success('Vaga movida para "Candidaturas Enviadas"!');
    } catch (error) {
      toast.error('Erro ao processar candidatura.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenMailClient = () => {
    window.open(`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* SEÇÃO 1: Análise de Match */}
      <div className="bg-gray-900 rounded-xl p-4 text-white shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-full">
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="font-bold text-base">Match: {matchAnalysis.score}%</h3>
            <p className="text-xs text-gray-400">Baseado nas suas skills.</p>
          </div>
        </div>
        {/* Visualização rápida de skills */}
        <div className="hidden md:flex gap-2">
          {matchAnalysis.found.slice(0, 3).map(skill => (
            <span key={skill} className="px-2 py-0.5 bg-green-900/50 text-green-300 text-[10px] rounded border border-green-700">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* SEÇÃO 2: Cartão Principal */}
      <Card className="border shadow-sm overflow-hidden bg-white">

        {/* Header do Card com Botão de Salvar */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-800">Candidatura</h2>
          </div>

          {/* BOTÃO DE SALVAR / DESALVAR (TOGGLE) */}
          <Button
            onClick={handleToggleSave}
            disabled={isLoading || status === 'applied'}
            variant="ghost"
            size="sm"
            className={`
              transition-all duration-200 gap-2 border
              ${status === 'saved'
                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                : 'text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
              ${status === 'applied' ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {status === 'saved' ? (
              <>
                <Bookmark className="w-4 h-4 fill-blue-600" />
                Salvo
              </>
            ) : status === 'applied' ? (
              <>
                <Check className="w-4 h-4" />
                Aplicado
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                Salvar em Pipeline
              </>
            )}
          </Button>
        </div>

        {/* Corpo do Formulário */}
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Assunto</label>
            <input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Mensagem</label>
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={8}
              className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm font-mono leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y shadow-sm"
            />
          </div>

          {/* Footer de Ações */}
          <div className="pt-2 flex flex-col gap-3">

            {status === 'applied' ? (
              <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center gap-2 text-green-700 font-medium">
                <Check className="w-5 h-5" />
                <span>Candidatura registrada no Pipeline!</span>
              </div>
            ) : (
              <div className="flex gap-3">
                {/* Botão Secundário (Apenas abrir cliente de email) */}
                <Button
                  onClick={handleOpenMailClient}
                  variant="outline"
                  className="flex-1 text-gray-600 border-gray-300 hover:bg-gray-50"
                  title="Abrir no seu app de email padrão"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Abrir Email
                </Button>

                {/* Botão Primário (Enviar & Aplicar) */}
                <Button
                  onClick={handleSendEmail}
                  disabled={isLoading}
                  className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition-all hover:scale-[1.01]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar & Aplicar
                    </>
                  )}
                </Button>
              </div>
            )}

            {status !== 'applied' && (
              <p className="text-center text-[10px] text-gray-400">
                Ao clicar em "Enviar & Aplicar", a vaga será movida automaticamente para a coluna "Enviado".
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
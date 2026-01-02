'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Mail, Copy, Sparkles, CheckCircle, AlertTriangle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { JobDetails } from '@/services/jobs-service';
import { pipelineApi } from '@/lib/api';
import { useAppStore } from '@/lib/store';

interface JobCopilotProps {
  job: JobDetails;
}

// SIMULAÇÃO: No futuro isso virá do perfil do usuário no banco de dados
const MY_SKILLS = ['react', 'typescript', 'next.js', 'node.js', 'tailwindcss', 'postgresql', 'git'];

// DICIONÁRIO: Tecnologias comuns para buscar no texto
const TECH_KEYWORDS = [
  'react', 'vue', 'angular', 'typescript', 'javascript', 'java', 'python', 'c#', 
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'graphql', 'rest', 'node.js', 
  'nestjs', 'next.js', 'postgresql', 'mongodb', 'mysql', 'redis', 'tailwindcss', 
  'sass', 'figma', 'git', 'ci/cd', 'terraform'
];

export function JobCopilot({ job }: JobCopilotProps) {
  const { userId } = useAppStore();
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  
  const [isMarking, setIsMarking] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  // Análise de Skills
  const matchAnalysis = useMemo(() => {
    if (!job?.description) return { found: [], missing: [] };

    const descriptionLower = job.description.toLowerCase();
    
    const skillsInJob = TECH_KEYWORDS.filter(tech => 
      descriptionLower.includes(tech.toLowerCase())
    );

    const found = skillsInJob.filter(skill => MY_SKILLS.includes(skill));
    const missing = skillsInJob.filter(skill => !MY_SKILLS.includes(skill));

    return { found, missing };
  }, [job]);

  useEffect(() => {
    if (job) {
      generateTemplate();
    }
  }, [job]);

  const generateTemplate = () => {
    const subject = `Candidatura para ${job.title} - Wendel`;
    const body = `Olá, time de recrutamento da ${job.company.name}, tudo bem?

Me chamo Wendel e gostaria de me candidatar à vaga de ${job.title}. Encontrei a oportunidade e me interessei bastante pela posição.

Atuo como Desenvolvedor com foco em entregar soluções escaláveis.

Resumo técnico:
${matchAnalysis.found.length > 0 ? matchAnalysis.found.map(s => `- ${s.charAt(0).toUpperCase() + s.slice(1)}`).join('\n') : '- React, Node.js e TypeScript'}

Fico à disposição para conversar e compartilhar mais detalhes sobre meus projetos.

Atenciosamente,
Wendel
[Seu LinkedIn]`;

    setEmailSubject(subject);
    setEmailBody(body);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(`${emailSubject}\n\n${emailBody}`);
    toast.success('Email copiado para a área de transferência!');
  };

  const handleOpenMailClient = () => {
    const mailtoLink = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoLink, '_blank');
  };

  // --- FUNÇÃO CORRIGIDA E SIMPLIFICADA ---
  const handleMarkAsApplied = async () => {
    if (!userId) return;
    setIsMarking(true);

    try {
      // 1. Garante que a vaga está no sistema. 
      // Graças à alteração no backend, isso retorna o ID mesmo se já existir.
      const savedItem = await pipelineApi.create(userId, job.id);
      
      // 2. Atualiza o status para 'applied' usando o ID retornado
      await pipelineApi.updateStatus(savedItem.id, 'applied');
      
      setIsApplied(true);
      toast.success('Vaga movida para "Minhas Candidaturas"!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar status. Verifique sua conexão.');
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* CARD 1: Análise de Match */}
      <Card className="bg-white border-none shadow-md overflow-hidden">
        <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-semibold flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Análise de Compatibilidade
          </h2>
          <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">BETA</span>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-600" />
              Seus Pontos Fortes
            </h3>
            {matchAnalysis.found.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {matchAnalysis.found.map(skill => (
                  <span key={skill} className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-md border border-green-100">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Nenhuma skill do seu perfil encontrada.</p>
            )}
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-orange-500" />
              Skills Faltantes na Vaga
            </h3>
            {matchAnalysis.missing.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {matchAnalysis.missing.map(skill => (
                  <span key={skill} className="px-2 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-md border border-orange-100">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Nenhuma skill faltante detectada!</p>
            )}
          </div>
        </div>
      </Card>

      {/* CARD 2: Gerador de Email */}
      <Card className="border-2 border-blue-50 bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900">
            <Mail className="h-5 w-5 text-blue-600" />
            Candidatura Inteligente
          </h2>
        </div>

        <p className="mb-4 text-xs text-gray-500">
          Este modelo foi pré-preenchido com as skills encontradas.
        </p>

        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-gray-500">Assunto</label>
          <input 
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-gray-500">Mensagem</label>
          <textarea 
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            rows={12}
            className="w-full resize-y rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={handleOpenMailClient} className="w-full gap-2 font-semibold">
            <Mail className="h-4 w-4" />
            Abrir no Email
          </Button>
          
          <Button onClick={handleCopyEmail} variant="outline" className="w-full gap-2">
            <Copy className="h-4 w-4" />
            Copiar Texto
          </Button>
        </div>

        {/* BOTÃO "JÁ ME CANDIDATEI" */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          {isApplied ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center gap-2 text-green-700 text-sm font-medium animate-in fade-in">
              <CheckCircle className="w-5 h-5" />
              Candidatura registrada!
            </div>
          ) : (
            <div className="space-y-2">
              <Button 
                onClick={handleMarkAsApplied} 
                disabled={isMarking}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold gap-2 shadow-sm transition-all"
              >
                {isMarking ? 'Atualizando...' : (
                  <>
                    <Check className="w-4 h-4" />
                    Já me candidatei!
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-gray-400">
                Isso moverá a vaga para a aba "Minhas Candidaturas"
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
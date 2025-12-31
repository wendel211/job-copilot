'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Mail, Copy, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { JobDetails } from '@/services/jobs-service';

interface JobCopilotProps {
  job: JobDetails;
}

export function JobCopilot({ job }: JobCopilotProps) {
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Gera o template assim que o componente recebe a vaga
  useEffect(() => {
    if (job) {
      generateTemplate();
    }
  }, [job]);

  const generateTemplate = () => {
    const subject = `Candidatura para ${job.title} - [Seu Nome]`;
    
    const body = `Olá, time de recrutamento da ${job.company.name}, tudo bem?

Me chamo [Seu Nome] e gostaria de me candidatar à vaga de ${job.title}. Encontrei a oportunidade e me interessei bastante pela posição.

Atuo como [Sua Função] com foco em entregar soluções escaláveis.

Resumo técnico:
- Front-end: React, Next.js, TailwindCSS
- Back-end: Node.js, NestJS
- Banco de dados: PostgreSQL

Fico à disposição para conversar e compartilhar mais detalhes sobre meus projetos.

Atenciosamente,
[Seu Nome]
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

  return (
    <Card className="sticky top-6 border-2 border-primary/10 bg-white p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900">
          <Mail className="h-5 w-5 text-blue-600" />
          Candidatura Inteligente
        </h2>
      </div>

      <p className="mb-4 text-xs text-gray-500">
        Este modelo foi gerado automaticamente. Edite e envie.
      </p>

      {/* Campo Assunto */}
      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-gray-500">Assunto</label>
        <input 
          value={emailSubject}
          onChange={(e) => setEmailSubject(e.target.value)}
          className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Campo Corpo */}
      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-gray-500">Mensagem</label>
        <textarea 
          value={emailBody}
          onChange={(e) => setEmailBody(e.target.value)}
          rows={12}
          className="w-full resize-y rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Ações */}
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

      {/* Banner IA */}
      <div className="mt-6 rounded-lg bg-blue-50 p-3 text-center border border-blue-100">
        <p className="text-xs text-blue-600 flex items-center justify-center gap-2">
          <Sparkles className="w-3 h-3" />
          <strong>Job Copilot AI:</strong> Em breve, este texto será 100% personalizado com suas skills.
        </p>
      </div>
    </Card>
  );
}
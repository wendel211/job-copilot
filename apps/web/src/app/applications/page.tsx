'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { pipelineApi } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';
import { 
  Calendar, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  Copy,      
  CopyCheck,  
  XCircle,
  Clock,
  Trophy
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner'; 

interface ApplicationItem {
  id: string;
  status: 'applied' | 'interview' | 'offer' | 'rejected' | 'closed';
  appliedAt: string | null;
  job: {
    id: string;
    title: string;
    applyUrl: string;
    company: {
      name: string;
    };
  };
}

export default function ApplicationsPage() {
  const { userId } = useAppStore();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar qual item foi copiado recentemente (para mudar o ícone)
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadApplications() {
      if (!userId) return;
      try {
        const items = await pipelineApi.getAll(userId);
        
        // Filtra e ordena (mais recentes primeiro)
        const applied = items
          .filter((item: any) => 
            ['applied', 'interview', 'offer', 'rejected'].includes(item.status)
          )
          .sort((a: any, b: any) => {
             const dateA = new Date(a.appliedAt || a.createdAt).getTime();
             const dateB = new Date(b.appliedAt || b.createdAt).getTime();
             return dateB - dateA;
          })
          .map((item: any): ApplicationItem => ({
            id: item.id,
            status: item.status as 'applied' | 'interview' | 'offer' | 'rejected' | 'closed',
            appliedAt: item.appliedAt,
            job: item.job,
          }));

        setApplications(applied);
      } catch (error) {
        console.error(error);
        toast.error('Erro ao carregar candidaturas');
      } finally {
        setLoading(false);
      }
    }
    loadApplications();
  }, [userId]);

  // Função para copiar o link da vaga
  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Link da vaga copiado!');

    // Volta o ícone para o normal depois de 2 segundos
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Função auxiliar para definir cor e ícone do status
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'offer':
        return { color: 'success', icon: <Trophy className="w-3 h-3" />, label: 'Proposta Recebida' };
      case 'interview':
        return { color: 'warning', icon: <Clock className="w-3 h-3" />, label: 'Entrevista' };
      case 'rejected':
        return { color: 'danger', icon: <XCircle className="w-3 h-3" />, label: 'Não selecionado' };
      case 'applied':
      default:
        return { color: 'blue', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Candidatura Enviada' };
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in pb-10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Minhas Candidaturas</h1>
            <p className="text-gray-500 mt-1">Gerencie o histórico dos seus processos seletivos.</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-blue-600">{applications.length}</span>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Ativas</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center h-64 items-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 shadow-sm">
            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Nenhuma candidatura registrada</h3>
            <p className="text-gray-500 max-w-md mx-auto mt-2 mb-8 leading-relaxed">
              Utilize o <strong>JobCopilot</strong> nas páginas de vagas para gerar emails e clique em "Já me candidatei" para rastrear seu progresso aqui.
            </p>
            <Link href="/jobs">
              <Button size="lg" className="flex justify-center tems-center  shadow-lg shadow-blue-500/20">
                Explorar Vagas
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {applications.map((app) => {
              const statusConfig = getStatusConfig(app.status);
              const isCopied = copiedId === app.id;

              return (
                <Card key={app.id} className="hover:shadow-md transition-all duration-200 group border-l-4 border-l-transparent hover:border-l-blue-500">
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    
                    {/* Info Vaga */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {app.job.title}
                        </h3>
                        <div className="flex gap-1.5 items-center px-2.5 py-0.5">
                          <Badge variant={statusConfig.color as any} size="sm">
                            {statusConfig.icon} 
                            {statusConfig.label}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5 font-medium text-gray-700">
                          <Building2 className="w-4 h-4 text-gray-400" /> 
                          {app.job.company.name}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-gray-400" /> 
                          Aplicado em: <span className="text-gray-700 font-medium">
                            {app.appliedAt ? format(new Date(app.appliedAt), "dd 'de' MMM, yyyy", { locale: ptBR }) : 'Data n/a'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                      
                      {/* Botão de Copiar (Com o ícone copy-check quando clicado) */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyLink(app.job.applyUrl, app.id)}
                        className={isCopied ? "text-green-600 bg-green-50" : "text-gray-500 hover:text-gray-900"}
                        title="Copiar link da vaga"
                      >
                        {isCopied ? <CopyCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>

                      <a href={app.job.applyUrl} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" className="text-gray-600 hover:text-blue-600 gap-2">
                          Vaga Original <ExternalLink className="w-3 h-3" />
                        </Button>
                      </a>
                      
                      <Link href={`/jobs/${app.job.id}`}>
                        <Button size="sm" className="pl-4 pr-3 gap-2">
                          Detalhes <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>

                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
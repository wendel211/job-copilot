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
  X,
  Edit3,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { Job, pipelineApi, userApi, jobsApi } from '@/lib/api';
import { useAppStore } from '@/lib/store';

interface JobCopilotProps {
  job: Job;
  onJobUpdate?: (updatedJob: Job) => void;
}

interface UserProfile {
  skills: string[];
  headline: string;
  bio: string;
}

// Lista expandida de tecnologias para melhor detecção de skills
const TECH_KEYWORDS = [
  // Frontend
  'react', 'reactjs', 'react.js', 'vue', 'vuejs', 'vue.js', 'angular', 'angularjs', 'svelte', 'next.js', 'nextjs', 'nuxt', 'nuxtjs', 'gatsby',
  'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less', 'tailwind', 'tailwindcss', 'bootstrap', 'material-ui', 'mui', 'chakra', 'styled-components',
  'webpack', 'vite', 'rollup', 'parcel', 'esbuild', 'babel',

  // Linguagens
  'javascript', 'typescript', 'java', 'python', 'c#', 'csharp', '.net', 'dotnet', 'c++', 'cpp', 'go', 'golang', 'rust', 'ruby', 'php', 'kotlin', 'swift', 'scala', 'elixir', 'clojure',

  // Backend
  'node', 'nodejs', 'node.js', 'express', 'expressjs', 'nestjs', 'nest.js', 'fastify', 'koa', 'hapi',
  'spring', 'springboot', 'spring boot', 'django', 'flask', 'fastapi', 'rails', 'ruby on rails', 'laravel', 'symfony',

  // Banco de Dados
  'sql', 'postgresql', 'postgres', 'mysql', 'mariadb', 'oracle', 'sqlserver', 'sql server', 'mongodb', 'mongo', 'redis', 'elasticsearch', 'cassandra', 'dynamodb', 'firebase', 'firestore', 'supabase', 'prisma',

  // Cloud e DevOps
  'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'heroku', 'vercel', 'netlify', 'digitalocean',
  'docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'jenkins', 'github actions', 'gitlab ci', 'circleci', 'ci/cd', 'cicd',
  'linux', 'ubuntu', 'nginx', 'apache',

  // API e Protocolos
  'rest', 'restful', 'api rest', 'graphql', 'grpc', 'websocket', 'soap', 'microservices', 'microsserviços',

  // Mobile
  'react native', 'flutter', 'dart', 'ios', 'android', 'kotlin', 'swift', 'expo',

  // Ferramentas e Outros
  'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'figma', 'sketch', 'adobe xd',
  'agile', 'scrum', 'kanban', 'tdd', 'bdd', 'solid', 'clean code', 'design patterns',
  'jest', 'mocha', 'cypress', 'playwright', 'selenium', 'junit', 'pytest',
  'rabbitmq', 'kafka', 'sqs', 'sns', 'pub/sub',

  // Data e AI
  'machine learning', 'ml', 'deep learning', 'ai', 'inteligência artificial', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'data science', 'big data', 'spark', 'hadoop', 'dbt', 'airflow', 'etl',

  // Segurança
  'oauth', 'jwt', 'auth', 'autenticação', 'segurança', 'security', 'ssl', 'tls'
];

// Mapa de sinônimos para normalização (key -> valor canônico)
const SKILL_ALIASES: Record<string, string> = {
  'js': 'javascript',
  'ts': 'typescript',
  'reactjs': 'react',
  'react.js': 'react',
  'vuejs': 'vue',
  'vue.js': 'vue',
  'angularjs': 'angular',
  'nodejs': 'node.js',
  'node': 'node.js',
  'expressjs': 'express',
  'nest.js': 'nestjs',
  'nextjs': 'next.js',
  'nuxtjs': 'nuxt',
  'postgres': 'postgresql',
  'mongo': 'mongodb',
  'k8s': 'kubernetes',
  'csharp': 'c#',
  'dotnet': '.net',
  'golang': 'go',
  'amazon web services': 'aws',
  'google cloud': 'gcp',
  'microsserviços': 'microservices',
  'restful': 'rest',
  'api rest': 'rest',
  'cicd': 'ci/cd',
  'springboot': 'spring boot',
  'ruby on rails': 'rails',
  'sql server': 'sqlserver',
  'inteligência artificial': 'ai'
};

export function JobCopilot({ job, onJobUpdate }: JobCopilotProps) {
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

  // Estados para edição de descrição
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(job.description || '');
  const [isSavingDescription, setIsSavingDescription] = useState(false);

  // Atualizar descrição editada quando job mudar
  useEffect(() => {
    setEditedDescription(job.description || '');
    setIsEditingDescription(false);
  }, [job.id, job.description]);

  // Função para salvar descrição
  const handleSaveDescription = async () => {
    if (editedDescription.trim().length < 50) {
      toast.error('Descrição deve ter pelo menos 50 caracteres');
      return;
    }

    setIsSavingDescription(true);
    try {
      const updatedJob = await jobsApi.updateDescription(job.id, editedDescription.trim());
      toast.success('Descrição atualizada! O match será recalculado.');
      setIsEditingDescription(false);
      // Notificar componente pai sobre atualização
      if (onJobUpdate) {
        onJobUpdate(updatedJob);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao salvar descrição';
      toast.error(message);
    } finally {
      setIsSavingDescription(false);
    }
  };

  // Cancelar edição
  const handleCancelEdit = () => {
    setEditedDescription(job.description || '');
    setIsEditingDescription(false);
  };

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

  // 2. Análise de Match (usando profile real - SEM fallback de 50%)
  const matchAnalysis = useMemo(() => {
    if (!job?.description && !job?.title) return { found: [], missing: [], score: 0, extractedJobSkills: [] };

    // Combinar título e descrição para análise mais completa
    const fullJobText = `${job.title || ''} ${job.description || ''}`.toLowerCase();

    // Função para normalizar skill (aplicar aliases)
    const normalizeSkill = (skill: string): string => {
      const lower = skill.toLowerCase().trim();
      return SKILL_ALIASES[lower] || lower;
    };

    // Função para verificar se uma tech existe no texto usando word boundary
    const containsSkill = (text: string, skill: string): boolean => {
      // Escapar caracteres especiais de regex
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Usar word boundary para evitar falsos positivos (ex: "go" em "google")
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      return regex.test(text);
    };

    // Extrair todas as skills encontradas na vaga (descrição + título)
    const extractedJobSkills: string[] = [];
    for (const tech of TECH_KEYWORDS) {
      if (containsSkill(fullJobText, tech)) {
        const normalized = normalizeSkill(tech);
        if (!extractedJobSkills.includes(normalized)) {
          extractedJobSkills.push(normalized);
        }
      }
    }

    // Normalizar skills do usuário
    const userSkillsNormalized = userProfile.skills.map(s => normalizeSkill(s));

    // Sem skills no perfil = 0% de match
    if (userSkillsNormalized.length === 0) {
      return { found: [], missing: extractedJobSkills, score: 0, extractedJobSkills };
    }

    // Encontrar matches entre skills do usuário e skills da vaga
    const foundSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const jobSkill of extractedJobSkills) {
      if (userSkillsNormalized.includes(jobSkill)) {
        if (!foundSkills.includes(jobSkill)) {
          foundSkills.push(jobSkill);
        }
      } else {
        if (!missingSkills.includes(jobSkill)) {
          missingSkills.push(jobSkill);
        }
      }
    }

    // Também verificar skills do usuário que aparecem diretamente no texto (podem não estar na lista TECH_KEYWORDS)
    for (const userSkill of userProfile.skills) {
      const normalized = normalizeSkill(userSkill);
      if (containsSkill(fullJobText, userSkill) && !foundSkills.includes(normalized)) {
        foundSkills.push(normalized);
      }
    }

    // Calcular score baseado em múltiplos fatores
    let score = 0;
    let factors = 0;

    // Fator 1: % de skills do usuário que aparecem na vaga (peso 40%)
    if (userProfile.skills.length > 0) {
      const directMatchPercent = (foundSkills.length / userProfile.skills.length) * 100;
      score += directMatchPercent * 0.4;
      factors++;
    }

    // Fator 2: % de tech keywords da vaga que o usuário tem (peso 40%)
    if (extractedJobSkills.length > 0) {
      const techMatchPercent = (foundSkills.length / extractedJobSkills.length) * 100;
      score += techMatchPercent * 0.4;
      factors++;
    }

    // Normaliza se só temos 1 fator
    if (factors === 1) {
      score = score * 2.5; // Ajustar para dar mais peso
    }

    // Bonus: Headline match (+15%)
    if (userProfile.headline) {
      const headlineWords = userProfile.headline.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const headlineMatch = headlineWords.some(word => containsSkill(fullJobText, word));
      if (headlineMatch) {
        score = Math.min(100, score + 15);
      }
    }

    // Bonus: Bio keywords match (+10%)
    if (userProfile.bio) {
      const bioWords = userProfile.bio.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      const significantBioWords = bioWords.slice(0, 20);
      const bioMatches = significantBioWords.filter(word => containsSkill(fullJobText, word)).length;
      if (bioMatches >= 3) {
        score = Math.min(100, score + 10);
      }
    }

    // Bonus: Skills muito importantes encontradas (+5% cada, máx 20%)
    const criticalSkills = ['react', 'node.js', 'typescript', 'python', 'java', 'aws'];
    const criticalFound = criticalSkills.filter(cs => foundSkills.includes(cs)).length;
    score = Math.min(100, score + Math.min(criticalFound * 5, 20));

    return {
      found: foundSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
      missing: missingSkills.slice(0, 10), // Limitar a 10 para não poluir a UI
      score: Math.round(Math.min(100, score)),
      extractedJobSkills
    };
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
      <div className="bg-gray-900 rounded-xl p-4 text-white shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-full">
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-bold text-base">Match: {matchAnalysis.score}%</h3>
              <p className="text-xs text-gray-400">
                {matchAnalysis.extractedJobSkills.length} skills detectadas na vaga
              </p>
            </div>
          </div>
          {/* Barra de progresso visual */}
          <div className="hidden sm:block w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${matchAnalysis.score >= 70 ? 'bg-green-500' :
                matchAnalysis.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              style={{ width: `${matchAnalysis.score}%` }}
            />
          </div>
        </div>

        {/* Skills que você tem */}
        {matchAnalysis.found.length > 0 && (
          <div className="mb-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Check className="w-3 h-3 text-green-400" /> Skills que você tem:
            </p>
            <div className="flex flex-wrap gap-1">
              {matchAnalysis.found.slice(0, 8).map(skill => (
                <span key={skill} className="px-2 py-0.5 bg-green-900/50 text-green-300 text-[10px] rounded border border-green-700">
                  {skill}
                </span>
              ))}
              {matchAnalysis.found.length > 8 && (
                <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-[10px] rounded">
                  +{matchAnalysis.found.length - 8} mais
                </span>
              )}
            </div>
          </div>
        )}

        {/* Skills que faltam */}
        {matchAnalysis.missing.length > 0 && (
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <X className="w-3 h-3 text-red-400" /> Skills a desenvolver:
            </p>
            <div className="flex flex-wrap gap-1">
              {matchAnalysis.missing.slice(0, 6).map(skill => (
                <span key={skill} className="px-2 py-0.5 bg-red-900/30 text-red-300 text-[10px] rounded border border-red-800/50">
                  {skill}
                </span>
              ))}
              {matchAnalysis.missing.length > 6 && (
                <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-[10px] rounded">
                  +{matchAnalysis.missing.length - 6} mais
                </span>
              )}
            </div>
          </div>
        )}

        {/* Mensagem quando não há skills no perfil */}
        {userProfile.skills.length === 0 && (
          <p className="text-xs text-yellow-400 mt-2">
            ⚠️ Adicione suas skills no perfil para calcular o match.
          </p>
        )}
      </div>

      {/* SEÇÃO 2: Edição de Descrição */}
      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-800 text-sm">Descrição da Vaga</h3>
            {job.descriptionSource === 'manual' ? (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full font-medium">
                Manual
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full font-medium">
                Automático
              </span>
            )}
          </div>

          {/* Botão Editar só aparece se ainda não foi editada */}
          {!isEditingDescription && job.descriptionSource !== 'manual' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingDescription(true)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              <Edit3 className="w-3 h-3 mr-1" />
              Adicionar Descrição
            </Button>
          )}
        </div>

        {isEditingDescription ? (
          <div className="space-y-3">
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              placeholder="Cole aqui a descrição completa da vaga, incluindo requisitos, responsabilidades e qualificações..."
              className="w-full h-48 p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {editedDescription.length} caracteres (mín. 50)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isSavingDescription}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveDescription}
                  disabled={isSavingDescription || editedDescription.trim().length < 50}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSavingDescription ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-1" />
                  )}
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600 max-h-32 overflow-y-auto">
            {job.description?.length > 0 ? (
              <p className="whitespace-pre-line line-clamp-5">
                {job.description.substring(0, 500)}
                {job.description.length > 500 && '...'}
              </p>
            ) : (
              <p className="text-gray-400 italic">
                Nenhuma descrição disponível. Clique em "Editar" para colar a descrição da vaga.
              </p>
            )}
          </div>
        )}
      </div>

      {/* SEÇÃO 3: Cartão Principal */}
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
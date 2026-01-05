'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { LoadingSpinner } from '@/components/ui/Loading';
import { UserProfileSettings } from '@/components/settings/UserProfileSettings'; // <--- O COMPONENTE QUE CRIAMOS

import {
  User,
  Mail,
  Check,
  Info,
  ExternalLink,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { providersApi, type EmailProvider } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

// ============================================================================
// SMTP PRESETS
// ============================================================================
const SMTP_PRESETS = {
  gmail: {
    name: 'Gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    help: 'Use uma senha de app: https://myaccount.google.com/apppasswords',
  },
  outlook: {
    name: 'Outlook/Hotmail',
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    help: 'Use seu email e senha normais',
  },
  custom: {
    name: 'Personalizado',
    host: '',
    port: 587,
    secure: false,
    help: 'Configure manualmente seu servidor SMTP',
  },
};

// ============================================================================
// PROVIDER CARD COMPONENT
// ============================================================================
interface ProviderCardProps {
  provider: EmailProvider;
  onTest: (id: string) => void;
  onDelete: (id: string) => void;
  isTesting: boolean;
}

const ProviderCard = ({ provider, onTest, onDelete, isTesting }: ProviderCardProps) => {
  return (
    <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">
                {provider.fromName || 'Provedor SMTP'}
              </h3>
              {provider.isActive && (
                <Badge variant="success" size="sm">Ativo</Badge>
              )}
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Email:</strong> {provider.fromEmail}</p>
              <p><strong>Host:</strong> {provider.type === 'smtp' ? 'SMTP Personalizado' : provider.type.toUpperCase()}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 min-w-[100px]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTest(provider.id)}
              disabled={isTesting}
              className="w-full justify-start"
            >
              {isTesting ? <span className="mr-2"><LoadingSpinner size="sm" /></span> : <RefreshCw className="w-3 h-3 mr-2" />}
              Testar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(provider.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 w-full justify-start"
            >
              <Trash2 className="w-3 h-3 mr-2" />
              Remover
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function SettingsPage() {
  const { userId } = useAppStore();
  
  // Abas
  const [activeTab, setActiveTab] = useState<'profile' | 'smtp'>('profile');
  
  // Estado SMTP
  const [providers, setProviders] = useState<EmailProvider[]>([]);
  const [isLoadingSmtp, setIsLoadingSmtp] = useState(false); // Carrega só ao entrar na aba SMTP
  const [isSaving, setIsSaving] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  // Form SMTP
  const [preset, setPreset] = useState<keyof typeof SMTP_PRESETS>('gmail');
  const [formData, setFormData] = useState({
    smtpHost: SMTP_PRESETS.gmail.host,
    smtpPort: SMTP_PRESETS.gmail.port,
    smtpSecure: SMTP_PRESETS.gmail.secure,
    smtpUser: '',
    smtpPass: '',
    fromEmail: '',
    fromName: '',
  });

  // Carregar provedores apenas quando a aba SMTP for ativada (ou na montagem se preferir)
  useEffect(() => {
    if (activeTab === 'smtp' && userId) {
        loadProviders();
    }
  }, [activeTab, userId]);

  // Atualizar form ao mudar preset
  useEffect(() => {
    const selected = SMTP_PRESETS[preset];
    setFormData((prev) => ({
      ...prev,
      smtpHost: selected.host,
      smtpPort: selected.port,
      smtpSecure: selected.secure,
    }));
  }, [preset]);

  const loadProviders = async () => {
    try {
      setIsLoadingSmtp(true);
      const { providers: data } = await providersApi.list(userId);
      setProviders(data);
    } catch (error) {
      console.error('Erro ao carregar provedores:', error);
      toast.error('Erro ao carregar configurações de email.');
    } finally {
      setIsLoadingSmtp(false);
    }
  };

  const handleSubmitSmtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.smtpUser || !formData.smtpPass || !formData.fromEmail) {
      toast.warning('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setIsSaving(true);
      await providersApi.create({
        userId,
        type: 'smtp',
        ...formData,
      });
      await loadProviders();
      toast.success('Provedor SMTP configurado com sucesso!');
      
      // Limpar senha por segurança
      setFormData(prev => ({ ...prev, smtpPass: '' }));
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao configurar SMTP. Verifique os dados.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestSmtp = async (providerId: string) => {
    try {
      setTestingId(providerId);
      const result = await providersApi.test(providerId);
      if (result.ok) {
        toast.success('Conexão SMTP testada com sucesso!');
      } else {
        toast.error('Falha na conexão SMTP.');
      }
    } catch (error) {
      console.error('Erro no teste:', error);
      toast.error('Erro ao testar conexão.');
    } finally {
      setTestingId(null);
    }
  };

  const handleDeleteSmtp = async (providerId: string) => {
    if (!confirm('Tem certeza que deseja remover este provedor?')) return;

    try {
      await providersApi.delete(providerId);
      setProviders((prev) => prev.filter((p) => p.id !== providerId));
      toast.success('Provedor removido.');
    } catch (error) {
      console.error('Erro ao remover:', error);
      toast.error('Erro ao remover o provedor.');
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Configurações</h1>
          <p className="text-gray-500 mt-2">
            Gerencie seu perfil profissional e as integrações de envio de email.
          </p>
        </div>

        {/* Tabs de Navegação */}
        <div className="flex border-b border-gray-200">
            <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'profile' 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
                <User className="w-4 h-4" /> Meu Perfil
            </button>
            <button
                onClick={() => setActiveTab('smtp')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'smtp' 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
                <Mail className="w-4 h-4" /> Integrações (SMTP)
            </button>
        </div>

        {/* --- CONTEÚDO DA ABA: PERFIL --- */}
        {activeTab === 'profile' && (
            // Importamos o componente isolado para manter o código limpo
            <UserProfileSettings />
        )}

        {/* --- CONTEÚDO DA ABA: SMTP --- */}
        {activeTab === 'smtp' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            
            {/* Lista de Provedores Existentes */}
            {isLoadingSmtp ? (
                <div className="flex justify-center p-8"><LoadingSpinner /></div>
            ) : providers.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    Provedores Ativos
                </h2>
                {providers.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    onTest={handleTestSmtp}
                    onDelete={handleDeleteSmtp}
                    isTesting={testingId === provider.id}
                  />
                ))}
              </div>
            )}

            {/* Card de Informação/Ajuda */}
            <Card className="bg-blue-50 border-blue-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-bold mb-1">Como configurar o SMTP:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>
                        <strong>Gmail:</strong> Ative a verificação em 2 etapas e crie
                        uma <a href="https://myaccount.google.com/apppasswords" target="_blank" className="underline hover:text-blue-900">senha de app</a>.
                      </li>
                      <li>
                        <strong>Outlook:</strong> Use seu email e senha normais (ou senha de app se tiver 2FA).
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formulário de Novo Provedor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Adicionar Novo Provedor</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitSmtp} className="space-y-5">
                  
                  <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Predefinição</label>
                      <Select
                        value={preset}
                        onChange={(e) => setPreset(e.target.value as keyof typeof SMTP_PRESETS)}
                        options={[
                          { value: 'gmail', label: 'Gmail' },
                          { value: 'outlook', label: 'Outlook/Hotmail' },
                          { value: 'custom', label: 'Personalizado' },
                        ]}
                      />
                  </div>

                  {/* Configuração do Servidor */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Servidor SMTP</label>
                        <Input
                            value={formData.smtpHost}
                            onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
                            placeholder="smtp.gmail.com"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Porta</label>
                        <Input
                            type="number"
                            value={formData.smtpPort}
                            onChange={(e) => setFormData({ ...formData, smtpPort: Number(e.target.value) })}
                            required
                        />
                    </div>
                  </div>

                  {/* Credenciais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Usuário (Email de Login)</label>
                        <Input
                            type="email"
                            value={formData.smtpUser}
                            onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })}
                            placeholder="seu-email@gmail.com"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Senha / App Password</label>
                        <Input
                            type="password"
                            value={formData.smtpPass}
                            onChange={(e) => setFormData({ ...formData, smtpPass: e.target.value })}
                            placeholder="••••••••••••••••"
                            required
                        />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Email de Envio (From)</label>
                        <Input
                            type="email"
                            value={formData.fromEmail}
                            onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                            placeholder="Igual ao login"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Nome do Remetente</label>
                        <Input
                            value={formData.fromName}
                            onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                            placeholder="Ex: João da Silva"
                        />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                        type="submit"
                        disabled={isSaving}
                        isLoading={isSaving}
                        className="w-full md:w-auto"
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Salvar e Ativar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
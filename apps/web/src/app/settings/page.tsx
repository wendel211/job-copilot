'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';

import {
  Settings as SettingsIcon,
  Mail,
  Check,
  AlertCircle,
  Info,
  ExternalLink,
} from 'lucide-react';
import { providersApi, type EmailProvider } from '@/lib/api';
import { useAppStore } from '@/lib/store';

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
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">
                {provider.fromName || 'SMTP Provider'}
              </h3>
              {provider.isActive && (
                <Badge variant="success" size="sm">
                  Ativo
                </Badge>
              )}
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <strong>Email:</strong> {provider.fromEmail || 'Não configurado'}
              </p>
              <p>
                <strong>Tipo:</strong> {provider.type.toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTest(provider.id)}
              disabled={isTesting}
              isLoading={isTesting}
            >
              Testar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(provider.id)}
            >
              Remover
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// SETTINGS PAGE
// ============================================================================
export default function SettingsPage() {
  const { userId } = useAppStore();
  const [providers, setProviders] = useState<EmailProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  // Form state
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

  useEffect(() => {
    loadProviders();
  }, [userId]);

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
      setIsLoading(true);
      const { providers: data } = await providersApi.list(userId);
      setProviders(data);
    } catch (error) {
      console.error('Erro ao carregar provedores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.smtpUser || !formData.smtpPass || !formData.fromEmail) {
      alert('Preencha todos os campos obrigatórios');
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
      alert('Provedor SMTP configurado com sucesso! ✓');
      // Reset form
      setFormData({
        ...formData,
        smtpUser: '',
        smtpPass: '',
        fromEmail: '',
        fromName: '',
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao configurar SMTP');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async (providerId: string) => {
    try {
      setTestingId(providerId);
      const result = await providersApi.test(providerId);
      if (result.ok) {
        alert('✓ Conexão SMTP testada com sucesso!');
      }
    } catch (error) {
      console.error('Erro no teste:', error);
      alert('❌ Erro ao testar conexão. Verifique as credenciais.');
    } finally {
      setTestingId(null);
    }
  };

const handleDelete = async (providerId: string) => {
    if (!confirm('Tem certeza que deseja remover este provedor de e-mail?')) return;

    try {
      await providersApi.delete(providerId);
      
      setProviders((prev) => prev.filter((p) => p.id !== providerId));
      
      alert('Provedor removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover:', error);
      alert('Erro ao remover o provedor. Tente novamente.');
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-slide-in max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-1">
            Configure seu servidor SMTP para enviar emails
          </p>
        </div>

        {/* Existing Providers */}
        {!isLoading && providers.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Provedores Configurados
            </h2>
            {providers.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onTest={handleTest}
                onDelete={handleDelete}
                isTesting={testingId === provider.id}
              />
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">📧 Como configurar o SMTP:</p>
                <ul className="space-y-1">
                  <li>
                    <strong>Gmail:</strong> Ative a verificação em 2 etapas e crie
                    uma senha de app
                  </li>
                  <li>
                    <strong>Outlook:</strong> Use seu email e senha normais
                  </li>
                  <li>
                    <strong>Outros:</strong> Consulte a documentação do seu provedor
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add New Provider Form */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Adicionar Provedor SMTP
            </h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Preset Selection */}
              <Select
                label="Provedor"
                value={preset}
                onChange={(e) => setPreset(e.target.value as keyof typeof SMTP_PRESETS)}
                options={[
                  { value: 'gmail', label: 'Gmail' },
                  { value: 'outlook', label: 'Outlook/Hotmail' },
                  { value: 'custom', label: 'Personalizado' },
                ]}
              />

              {/* Help Text */}
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                {SMTP_PRESETS[preset].help}
                {preset === 'gmail' && (
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 ml-2 inline-flex items-center gap-1"
                  >
                    Criar senha de app
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Server Config */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Servidor SMTP"
                  value={formData.smtpHost}
                  onChange={(e) =>
                    setFormData({ ...formData, smtpHost: e.target.value })
                  }
                  placeholder="smtp.gmail.com"
                  required
                />
                <Input
                  label="Porta"
                  type="number"
                  value={formData.smtpPort}
                  onChange={(e) =>
                    setFormData({ ...formData, smtpPort: Number(e.target.value) })
                  }
                  required
                />
              </div>

              {/* Credentials */}
              <Input
                label="Usuário SMTP (Email)"
                type="email"
                value={formData.smtpUser}
                onChange={(e) =>
                  setFormData({ ...formData, smtpUser: e.target.value })
                }
                placeholder="seu-email@gmail.com"
                required
              />

              <Input
                label="Senha SMTP"
                type="password"
                value={formData.smtpPass}
                onChange={(e) =>
                  setFormData({ ...formData, smtpPass: e.target.value })
                }
                placeholder="••••••••••••••••"
                required
              />

              {/* From Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email de Envio"
                  type="email"
                  value={formData.fromEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, fromEmail: e.target.value })
                  }
                  placeholder="seu-email@gmail.com"
                  required
                />
                <Input
                  label="Nome do Remetente"
                  value={formData.fromName}
                  onChange={(e) =>
                    setFormData({ ...formData, fromName: e.target.value })
                  }
                  placeholder="Seu Nome"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSaving}
                isLoading={isSaving}
                className="w-full"
              >
                <Check className="w-4 h-4" />
                Salvar Configuração
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
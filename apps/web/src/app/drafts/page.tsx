'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/TextArea';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/Empty';
import { LoadingSpinner } from '@/components/ui/Loading';
import {
  Mail,
  Send,
  Edit3,
  Trash2,
  Building2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { draftsApi, emailApi, type EmailDraft } from '@/lib/api';
import { useAppStore } from '@/lib/store';

// ============================================================================
// DRAFT CARD COMPONENT
// ============================================================================
interface DraftCardProps {
  draft: EmailDraft;
  onEdit: (draft: EmailDraft) => void;
  onSend: (draftId: string) => void;
  onDelete: (draftId: string) => void;
  isSending: boolean;
}

const DraftCard = ({ draft, onEdit, onSend, onDelete, isSending }: DraftCardProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card hover>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {draft.subject}
              </h3>
              {draft.job && (
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <Building2 className="w-4 h-4" />
                  {draft.job.company.name} • {draft.job.title}
                </div>
              )}
            </div>
            <Badge variant="blue" size="sm">
              Rascunho
            </Badge>
          </div>

          {/* To Email */}
          {draft.toEmail && (
            <div className="text-sm">
              <span className="text-gray-600">Para:</span>{' '}
              <span className="text-gray-900">{draft.toEmail}</span>
            </div>
          )}

          {/* Body Preview */}
          <p className="text-sm text-gray-600 line-clamp-3">
            {draft.bodyText}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              Atualizado em {formatDate(draft.updatedAt)}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(draft)}
              >
                <Edit3 className="w-4 h-4" />
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(draft.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => onSend(draft.id)}
                disabled={isSending || !draft.toEmail}
                isLoading={isSending}
              >
                <Send className="w-4 h-4" />
                Enviar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// DRAFT EDITOR MODAL
// ============================================================================
interface DraftEditorProps {
  draft: EmailDraft | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (draft: Partial<EmailDraft>) => void;
  isSaving: boolean;
}

const DraftEditor = ({ draft, isOpen, onClose, onSave, isSaving }: DraftEditorProps) => {
  const [subject, setSubject] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [toEmail, setToEmail] = useState('');

  useEffect(() => {
    if (draft) {
      setSubject(draft.subject);
      setBodyText(draft.bodyText);
      setToEmail(draft.toEmail || '');
    }
  }, [draft]);

  if (!isOpen || !draft) return null;

  const handleSave = () => {
    onSave({ subject, bodyText, toEmail });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-3xl my-8 animate-slide-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Editar Rascunho
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Job Info */}
          {draft.job && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {draft.job.company.name}
                </span>
                <span className="text-blue-700">•</span>
                <span className="text-blue-700">{draft.job.title}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <Input
            label="Para"
            type="email"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            placeholder="recrutamento@empresa.com"
          />

          <Input
            label="Assunto"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Candidatura para [Vaga]"
          />

          <Textarea
            label="Mensagem"
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            rows={12}
            placeholder="Olá,&#10;&#10;Venho por meio deste email..."
          />

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!subject || !bodyText || isSaving}
              isLoading={isSaving}
              className="flex-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// DRAFTS PAGE
// ============================================================================
export default function DraftsPage() {
  const { userId } = useAppStore();
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDraft, setSelectedDraft] = useState<EmailDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sendingDraftId, setSendingDraftId] = useState<string | null>(null);

  useEffect(() => {
    loadDrafts();
  }, [userId]);

  const loadDrafts = async () => {
    try {
      setIsLoading(true);
      const { drafts: data } = await draftsApi.list(userId);
      setDrafts(data);
    } catch (error) {
      console.error('Erro ao carregar rascunhos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async (updates: Partial<EmailDraft>) => {
    if (!selectedDraft) return;

    try {
      setIsSaving(true);
      
      // --- CORREÇÃO APLICADA AQUI ---
      // Mapeamos os campos explicitamente e convertemos null para undefined
      await draftsApi.update(selectedDraft.id, userId, {
        subject: updates.subject,
        bodyText: updates.bodyText,
        toEmail: updates.toEmail ?? undefined, // '?? undefined' resolve o erro de tipo 'null'
      });

      await loadDrafts();
      setSelectedDraft(null);
      alert('Rascunho atualizado!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar rascunho');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendEmail = async (draftId: string) => {
    const draft = drafts.find((d) => d.id === draftId);
    if (!draft?.toEmail) {
      alert('Adicione um email de destino antes de enviar');
      return;
    }

    if (!confirm('Enviar este email?')) return;

    try {
      setSendingDraftId(draftId);
      await emailApi.sendDraft(userId, draftId);
      
      alert('Email enviado com sucesso! ✓');
      await loadDrafts();
    } catch (error) {
      console.error('Erro ao enviar:', error);
      alert('Erro ao enviar email. Verifique a configuração SMTP.');
    } finally {
      setSendingDraftId(null);
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (!confirm('Excluir este rascunho permanentemente?')) return;

    try {
      await draftsApi.delete(draftId, userId);
      
      // Atualiza estado local
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
      alert('Rascunho excluído!');
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir rascunho.');
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rascunhos</h1>
            <p className="text-gray-600 mt-1">
              {drafts.length} rascunhos de email
            </p>
          </div>
        </div>

        {/* Warning Card */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">⚠️ Configure o SMTP antes de enviar</p>
                <p>
                  Vá em <strong>Configurações</strong> para adicionar suas credenciais
                  SMTP (Gmail, Outlook, etc).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Drafts List */}
        {isLoading ? (
          <LoadingSpinner />
        ) : drafts.length === 0 ? (
          <EmptyState
            icon={<Mail className="w-12 h-12" />}
            title="Nenhum rascunho ainda"
            description="Rascunhos são gerados automaticamente ao salvar vagas"
            action={
              <Button onClick={() => window.location.href = '/jobs'}>
                <Mail className="w-4 h-4" />
                Buscar Vagas
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {drafts.map((draft) => (
              <DraftCard
                key={draft.id}
                draft={draft}
                onEdit={setSelectedDraft}
                onSend={handleSendEmail}
                onDelete={handleDeleteDraft}
                isSending={sendingDraftId === draft.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <DraftEditor
        draft={selectedDraft}
        isOpen={!!selectedDraft}
        onClose={() => setSelectedDraft(null)}
        onSave={handleSaveDraft}
        isSaving={isSaving}
      />
    </AppShell>
  );
}
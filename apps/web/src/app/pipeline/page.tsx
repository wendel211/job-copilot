'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/Empty';
import { LoadingSpinner } from '@/components/ui/Loading';
import {
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  MoreVertical,
  Trash2,
  Edit3,
} from 'lucide-react';
import { pipelineApi, type SavedJob } from '@/lib/api';
import { useAppStore } from '@/lib/store';

// ============================================================================
// TIPOS
// ============================================================================
const PIPELINE_COLUMNS = [
  { id: 'discovered', label: 'Descoberta', color: 'bg-gray-100' },
  { id: 'prepared', label: 'Preparado', color: 'bg-blue-100' },
  { id: 'sent', label: 'Enviado', color: 'bg-green-100' },
  { id: 'screening', label: 'Triagem', color: 'bg-yellow-100' },
  { id: 'interview', label: 'Entrevista', color: 'bg-purple-100' },
  { id: 'closed', label: 'Encerrado', color: 'bg-red-100' },
] as const;

type PipelineStatus = typeof PIPELINE_COLUMNS[number]['id'];

// ============================================================================
// PIPELINE CARD COMPONENT
// ============================================================================
interface PipelineCardProps {
  item: SavedJob;
  onStatusChange: (itemId: string, newStatus: PipelineStatus) => void;
  onDelete: (itemId: string) => void;
}

const PipelineCard = ({ item, onStatusChange, onDelete }: PipelineCardProps) => {
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <Card hover className="mb-3">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-gray-900 truncate">
                {item.job.title}
              </h3>
              <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                <Building2 className="w-3 h-3" />
                {item.job.company.name}
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      // TODO: Abrir modal de edição
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit3 className="w-3 h-3" />
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      onDelete(item.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remover
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-1.5">
            {item.job.location && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <MapPin className="w-3 h-3" />
                {item.job.location}
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Calendar className="w-3 h-3" />
              Adicionado em {formatDate(item.createdAt)}
            </div>
          </div>

          {/* ATS Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="blue" size="sm">
              {item.job.atsType.toUpperCase()}
            </Badge>
            {item.job.remote && (
              <Badge variant="success" size="sm">
                Remoto
              </Badge>
            )}
          </div>

          {/* Notes */}
          {item.notes && (
            <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded">
              {item.notes}
            </p>
          )}

          {/* Actions */}
          <a
            href={item.job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            Ver vaga
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// PIPELINE COLUMN COMPONENT
// ============================================================================
interface PipelineColumnProps {
  column: typeof PIPELINE_COLUMNS[number];
  items: SavedJob[];
  onStatusChange: (itemId: string, newStatus: PipelineStatus) => void;
  onDelete: (itemId: string) => void;
}

const PipelineColumn = ({
  column,
  items,
  onStatusChange,
  onDelete,
}: PipelineColumnProps) => {
  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-white rounded-xl border border-gray-200">
        {/* Column Header */}
        <div className={`${column.color} px-4 py-3 rounded-t-xl border-b border-gray-200`}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-gray-900">
              {column.label}
            </h3>
            <Badge variant="default" size="sm">
              {items.length}
            </Badge>
          </div>
        </div>

        {/* Column Content */}
        <div className="p-3 max-h-[calc(100vh-280px)] overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              Nenhuma vaga aqui
            </div>
          ) : (
            items.map((item) => (
              <PipelineCard
                key={item.id}
                item={item}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PIPELINE PAGE
// ============================================================================
export default function PipelinePage() {
  const { userId } = useAppStore();
  const [items, setItems] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPipeline();
  }, [userId]);

  const loadPipeline = async () => {
    try {
      setIsLoading(true);
      const data = await pipelineApi.list(userId);
      setItems(data);
    } catch (error) {
      console.error('Erro ao carregar pipeline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (itemId: string, newStatus: PipelineStatus) => {
    try {
      await pipelineApi.updateStatus(itemId, newStatus);
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao mover card');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Remover esta vaga do pipeline?')) return;
    
    try {
      // TODO: Adicionar endpoint de delete na API
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      alert('Vaga removida!');
    } catch (error) {
      console.error('Erro ao remover:', error);
    }
  };

  const getItemsByStatus = (status: PipelineStatus) =>
    items.filter((item) => item.status === status);

  const totalItems = items.length;
  const sentItems = items.filter((i) => i.status === 'sent').length;
  const interviewItems = items.filter((i) => i.status === 'interview').length;

  return (
    <AppShell>
      <div className="space-y-6 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pipeline</h1>
            <p className="text-gray-600 mt-1">
              {totalItems} vagas • {sentItems} enviadas • {interviewItems} entrevistas
            </p>
          </div>
        </div>

        {/* Pipeline Board */}
        {isLoading ? (
          <LoadingSpinner />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-12 h-12" />}
            title="Nenhuma vaga no pipeline"
            description="Comece salvando vagas na página de busca"
            action={
              <Button onClick={() => window.location.href = '/jobs'}>
                Buscar Vagas
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {PIPELINE_COLUMNS.map((column) => (
                <PipelineColumn
                  key={column.id}
                  column={column}
                  items={getItemsByStatus(column.id)}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}

        {/* Info Card */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              💡 Como usar o Pipeline
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Descoberta</strong>: Vagas que você acabou de salvar</li>
              <li>• <strong>Preparado</strong>: Email rascunho criado</li>
              <li>• <strong>Enviado</strong>: Candidatura enviada</li>
              <li>• <strong>Triagem</strong>: Recebeu resposta/em análise</li>
              <li>• <strong>Entrevista</strong>: Convocado para entrevista</li>
              <li>• <strong>Encerrado</strong>: Processo finalizado</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
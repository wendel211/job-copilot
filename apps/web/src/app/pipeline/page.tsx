'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter,
} from '@dnd-kit/core';
import { toast } from 'sonner';

import AppShell from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/Empty';
import { LoadingSpinner } from '@/components/ui/Loading';
import { EditJobModal } from '@/components/pipeline/EditJobModal';
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
// CONFIGURAÇÕES E TIPOS
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
// COMPONENTES AUXILIARES DE DRAG & DROP
// ============================================================================

// 1. Wrapper para tornar o Card arrastável
const DraggablePipelineCard = ({ item, ...props }: PipelineCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { item },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 50 : undefined,
        opacity: isDragging ? 0.3 : 1, // Opacidade do item original enquanto arrasta
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none">
      <PipelineCard item={item} {...props} isDragging={isDragging} />
    </div>
  );
};

// 2. Wrapper para tornar a Coluna um alvo
const DroppableColumn = ({ column, children }: { column: any; children: React.ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div ref={setNodeRef} className="flex-shrink-0 w-80">
      <div className={`bg-white rounded-xl border transition-colors h-full flex flex-col ${
        isOver ? 'border-blue-400 bg-blue-50/30' : 'border-gray-200'
      }`}>
        {/* Column Header */}
        <div className={`${column.color} px-4 py-3 rounded-t-xl border-b border-gray-200`}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-gray-900">{column.label}</h3>
          </div>
        </div>
        {/* Column Content Area */}
        <div className="p-3 flex-1 min-h-[150px] overflow-y-auto max-h-[calc(100vh-280px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE CARD (UI PURA)
// ============================================================================
interface PipelineCardProps {
  item: SavedJob;
  onEdit: (item: SavedJob) => void;
  onDelete: (itemId: string) => void;
  isDragging?: boolean;
}

const PipelineCard = ({ item, onEdit, onDelete, isDragging }: PipelineCardProps) => {
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <Card 
      className={`mb-3 transition-shadow bg-white ${isDragging ? 'shadow-2xl ring-2 ring-blue-500 rotate-2' : 'hover:shadow-md'}`}
    >
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
            {/* Menu Ações (só mostra se não estiver arrastando) */}
            {!isDragging && (
              <div className="relative" onPointerDown={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(item);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit3 className="w-3 h-3" />
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(item.id);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remover
                    </button>
                  </div>
                )}
              </div>
            )}
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
              {formatDate(item.createdAt)}
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
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
            <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded border border-gray-100">
              {item.notes}
            </p>
          )}

          {/* Link (só mostra se não estiver arrastando) */}
          {!isDragging && (
            <a
              href={item.job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onPointerDown={(e) => e.stopPropagation()} 
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mt-2"
            >
              Ver vaga
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// PÁGINA PRINCIPAL
// ============================================================================
export default function PipelinePage() {
  const { userId } = useAppStore();
  const [items, setItems] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<SavedJob | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null); // ID do card sendo arrastado

  // Sensores DND configurados para permitir clique vs arraste
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Só inicia drag após mover 8px
      },
    })
  );

  useEffect(() => {
    if (userId) loadPipeline();
  }, [userId]);

  const loadPipeline = async () => {
    try {
      setIsLoading(true);
      const data = await pipelineApi.list(userId);
      setItems(data);
    } catch (error) {
      toast.error('Erro ao carregar pipeline');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Drag & Drop Handler
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const itemId = active.id as string;
    const newStatus = over.id as PipelineStatus;
    const currentItem = items.find((i) => i.id === itemId);

    // Se soltou na mesma coluna ou item inválido
    if (!currentItem || currentItem.status === newStatus) return;

    // 1. Atualização Otimista (UI muda na hora)
    const previousItems = [...items];
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    );

    try {
      // 2. Chama API
      await pipelineApi.updateStatus(itemId, newStatus);
      toast.success(`Movido para ${PIPELINE_COLUMNS.find(c => c.id === newStatus)?.label}`);
    } catch (error) {
      // 3. Rollback se der erro
      setItems(previousItems);
      toast.error('Erro ao mover card. Tente novamente.');
      console.error(error);
    }
  };

  const handleDelete = async (itemId: string) => {
    toast.promise(
      // Simulação de delete (implemente o endpoint na API se não existir)
      new Promise((resolve) => {
        setItems((prev) => prev.filter((item) => item.id !== itemId));
        resolve(true);
      }),
      {
        loading: 'Removendo...',
        success: 'Vaga removida do pipeline',
        error: 'Erro ao remover vaga',
      }
    );
  };

  const handleUpdateJob = async (id: string, data: { notes?: string }) => {
    // Aqui você chamaria pipelineApi.update(id, data)
    // Vamos simular atualizando o estado local por enquanto
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    // TODO: Chamar API real de update
    // await pipelineApi.update(id, data);
  };

  const getItemsByStatus = (status: PipelineStatus) =>
    items.filter((item) => item.status === status);

  const activeItem = activeId ? items.find((i) => i.id === activeId) : null;

  return (
    <AppShell>
      <div className="space-y-6 animate-slide-in h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0">
          <h1 className="text-3xl font-bold text-gray-900">Pipeline</h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas candidaturas em tempo real
          </p>
        </div>

        {/* Board */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-12 h-12" />}
            title="Pipeline vazio"
            description="Salve vagas na busca para começar a acompanhar."
            action={
              <Button onClick={() => (window.location.href = '/jobs')}>
                Buscar Vagas
              </Button>
            }
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(e) => setActiveId(e.active.id as string)}
            onDragEnd={handleDragEnd}
          >
            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
              <div className="flex gap-4 h-full min-w-max px-1">
                {PIPELINE_COLUMNS.map((column) => (
                  <DroppableColumn key={column.id} column={column}>
                    {getItemsByStatus(column.id).map((item) => (
                      <DraggablePipelineCard
                        key={item.id}
                        item={item}
                        onEdit={setEditingJob}
                        onDelete={handleDelete}
                      />
                    ))}
                  </DroppableColumn>
                ))}
              </div>
            </div>

            {/* Overlay do Card enquanto arrasta */}
            <DragOverlay>
              {activeItem ? (
                <PipelineCard
                  item={activeItem}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  isDragging
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {/* Modais */}
        {editingJob && (
          <EditJobModal
            job={editingJob}
            onClose={() => setEditingJob(null)}
            onSave={handleUpdateJob}
          />
        )}
      </div>
    </AppShell>
  );
}
'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { EmptyState } from '@/components/ui/Empty';
import { LoadingSpinner } from '@/components/ui/Loading';
import { EditJobModal } from '@/components/pipeline/EditJobModal';
import { AtsBadge } from '@/components/pipeline/AtsBadge';
import { PipelineToolbar } from '@/components/pipeline/PipelineToolbar';

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
// CONFIGURAÇÕES
// ============================================================================
const PIPELINE_COLUMNS = [
  { id: 'discovered', label: 'Interesse / Salvas', color: 'bg-gray-50 border-gray-200' },
  { id: 'applied', label: 'Candidaturas Enviadas', color: 'bg-blue-50 border-blue-200' },
  { id: 'interview', label: 'Entrevistas', color: 'bg-purple-50 border-purple-200' },
  { id: 'offer', label: 'Oferta / Proposta', color: 'bg-green-50 border-green-200' },
  { id: 'rejected', label: 'Encerrado / Rejeitado', color: 'bg-red-50 border-red-200' },
] as const;

type PipelineStatus = typeof PIPELINE_COLUMNS[number]['id'];

// ============================================================================
// DRAGGABLE CARD WRAPPER
// ============================================================================
interface PipelineCardProps {
  item: SavedJob;
  onEdit: (item: SavedJob) => void;
  onDelete: (itemId: string) => void;
  isDragging?: boolean;
  dragHandlers?: any;
}

const DraggablePipelineCard = ({ item, ...props }: PipelineCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { item },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 50 : undefined,
        opacity: isDragging ? 0 : 1,
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <PipelineCard
        item={item}
        {...props}
        isDragging={isDragging}
        dragHandlers={{ ...listeners, ...attributes }}
      />
    </div>
  );
};

// ============================================================================
// DROPPABLE COLUMN (Scroll corrigido aqui)
// ============================================================================
const DroppableColumn = ({ column, children }: { column: any; children: React.ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const childCount = React.Children.count(children);

  return (
    <section ref={setNodeRef} className="flex-shrink-0 w-80 flex flex-col h-full">
      
      {/* Sticky Header */}
      <header className={`sticky top-0 z-10 p-3 rounded-t-xl border-t border-l border-r flex justify-between items-center ${column.color} backdrop-blur-sm`}>
        <h3 className="font-semibold text-sm text-gray-700">{column.label}</h3>
        <span className="bg-white/70 text-gray-700 text-xs px-2 py-0.5 rounded-full font-medium">
          {childCount}
        </span>
      </header>

      {/* 🔥 SCROLL CORRIGIDO AQUI → overflow-x-hidden */}
      <div
        className={`flex-1 p-2 space-y-3 overflow-y-auto overflow-x-hidden border-l border-r border-b border-gray-200 rounded-b-xl transition-colors ${
          isOver ? 'bg-blue-50/60 ring-2 ring-inset ring-blue-300' : 'bg-gray-50/30'
        }`}
      >
        {childCount === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-xs border-2 border-dashed border-gray-200 rounded-lg mx-2 my-2">
            Arraste cards aqui
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
};

// ============================================================================
// PIPELINE CARD UI
// ============================================================================
const PipelineCard = ({ item, onEdit, onDelete, isDragging, dragHandlers }: PipelineCardProps) => {
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!showMenu) return;
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setShowMenu(false);
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [showMenu]);

  return (
    <Card className={`relative bg-white transition-all ${isDragging ? 'shadow-2xl rotate-2 ring-2 ring-blue-500' : 'hover:shadow-md hover:border-blue-300'}`}>
      <CardContent className="p-4">
        
        {/* HEADER */}
        <div className="flex items-start gap-2 mb-3">
          
          {/* Área que arrasta */}
          <div {...dragHandlers} className="flex-1 min-w-0 cursor-grab active:cursor-grabbing">
            <h4 className="font-semibold text-sm text-gray-900 truncate" title={item.job.title}>
              {item.job.title}
            </h4>
          </div>

          {/* Menu */}
          {!isDragging && (
            <div className="relative">
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(v => !v);
                }}
                className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />

                  <div
                    className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => { setShowMenu(false); onEdit(item); }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" /> Editar
                    </button>

                    <button
                      onClick={() => { setShowMenu(false); onDelete(item.id); }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Remover
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Empresa e ATS */}
        <div {...dragHandlers} className="flex items-center gap-2 mb-3 cursor-grab">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 flex-1 min-w-0">
            <Building2 className="w-3.5 h-3.5" />
            <span className="truncate">{item.job.company.name}</span>
          </div>
          <AtsBadge type={item.job.atsType || 'unknown'} />
        </div>

        {/* Detalhes */}
        <div {...dragHandlers} className="grid grid-cols-2 gap-2 mb-3 cursor-grab">
          <div className="flex items-center text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 mr-1.5 opacity-70" />
            <span>{item.job.remote ? 'Remoto' : item.job.location || 'N/A'}</span>
          </div>

          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
            <span>{new Date(item.updatedAt).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        {/* Notas */}
        {item.notes && (
          <div {...dragHandlers} className="bg-yellow-50 border border-yellow-100 p-2 rounded text-xs italic mb-3">
            <p className="line-clamp-2">"{item.notes}"</p>
          </div>
        )}

        {/* Link */}
        {!isDragging && (
          <a
            href={item.job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="border-t border-gray-100 pt-3 -mx-4 px-4 -mb-4 pb-4 flex items-center justify-center text-xs text-blue-600 hover:bg-blue-50/50"
          >
            Ver Vaga <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
          </a>
        )}

      </CardContent>
    </Card>
  );
};

// ============================================================================
// PAGE
// ============================================================================
export default function PipelinePage() {
  const { userId } = useAppStore();

  const [items, setItems] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<SavedJob | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [hideCompleted, setHideCompleted] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    if (userId) loadPipeline();
  }, [userId]);

  const loadPipeline = async () => {
    try {
      setIsLoading(true);
      setItems(await pipelineApi.list(userId));
    } catch {
      toast.error('Erro ao carregar pipeline');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.job.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const isCompleted = ['rejected', 'closed'].includes(item.status);
      const matchesHide = hideCompleted ? !isCompleted : true;

      return matchesSearch && matchesHide;
    });
  }, [items, searchTerm, hideCompleted]);

  const visibleColumns = hideCompleted
    ? PIPELINE_COLUMNS.filter(c => c.id !== 'rejected')
    : PIPELINE_COLUMNS;

  const activeItem = useMemo(() => items.find(i => i.id === activeId), [items, activeId]);

  const getItemsByStatus = (status: PipelineStatus) => {
    if (status === 'interview') return filteredItems.filter(i => ['interview', 'screening'].includes(i.status));
    if (status === 'applied') return filteredItems.filter(i => ['applied', 'sent'].includes(i.status));
    if (status === 'rejected') return filteredItems.filter(i => ['rejected', 'closed'].includes(i.status));
    return filteredItems.filter(i => i.status === status);
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) return;

    const id = active.id as string;
    const newStatus = over.id as PipelineStatus;

    const current = items.find(i => i.id === id);
    if (!current || current.status === newStatus) return;

    const snapshot = [...items];
    setItems(prev => prev.map(i => (i.id === id ? { ...i, status: newStatus } : i)));

    try {
      await pipelineApi.updateStatus(id, newStatus);
      toast.success(`Movido para ${PIPELINE_COLUMNS.find(c => c.id === newStatus)?.label}`);
    } catch {
      setItems(snapshot);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDelete = async (id: string) => {
    const snapshot = [...items];
    setItems(prev => prev.filter(i => i.id !== id));

    try {
      await pipelineApi.delete(id);
      toast.success('Vaga removida do pipeline');
    } catch {
      setItems(snapshot);
      toast.error('Erro ao remover vaga');
    }
  };

  const handleUpdateNotes = async (id: string, data: { notes: string }) => {
    const snapshot = [...items];
    setItems(prev => prev.map(i => (i.id === id ? { ...i, notes: data.notes } : i)));

    try {
      await pipelineApi.addNote(id, data.notes);
      toast.success('Nota salva com sucesso');
    } catch {
      setItems(snapshot);
      toast.error('Erro ao salvar nota');
    }
  };

  return (
    <AppShell>
      <div className="h-full flex flex-col animate-fade-in">

        {/* HEADER */}
        <div className="flex-shrink-0 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Pipeline de Candidaturas</h1>
          <p className="text-gray-500">Gestão visual do seu processo seletivo.</p>
        </div>

        {/* Toolbar */}
        <PipelineToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          hideCompleted={hideCompleted}
          onToggleHideCompleted={() => setHideCompleted(!hideCompleted)}
          totalItems={items.length}
          visibleItems={filteredItems.length}
        />

        {/* BOARD */}
        {isLoading && items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-12 h-12 text-gray-300" />}
            title="Seu pipeline está vazio"
            description="Salve vagas para começar a organizar seu processo."
            action={<Button onClick={() => (window.location.href = '/jobs')}>Buscar Vagas</Button>}
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={e => setActiveId(e.active.id as string)}
            onDragEnd={handleDragEnd}
          >
            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-2">
              <div className="flex gap-4 h-full min-w-max px-1">
                
                {visibleColumns.map(col => (
                  <DroppableColumn key={col.id} column={col}>
                    {getItemsByStatus(col.id).map(item => (
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

            {/* Drag Overlay */}
            <DragOverlay>
              {activeItem && (
                <div className="w-80 opacity-90 cursor-grabbing">
                  <div className="bg-white p-4 rounded-lg shadow-2xl border-2 border-blue-500 rotate-2">
                    <h4 className="font-bold text-gray-900 mb-1">{activeItem.job.title}</h4>
                    <p className="text-sm text-gray-600">{activeItem.job.company.name}</p>
                  </div>
                </div>
              )}
            </DragOverlay>

          </DndContext>
        )}

        {/* Modal */}
        {editingJob && (
          <EditJobModal
            job={editingJob}
            onClose={() => setEditingJob(null)}
            onSave={handleUpdateNotes}
          />
        )}

      </div>
    </AppShell>
  );
}

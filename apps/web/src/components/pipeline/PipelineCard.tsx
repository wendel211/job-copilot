import { useEffect, useRef, useState } from 'react';
import {
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  MoreVertical,
  Trash2,
  Edit3,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/Card';
import { AtsBadge } from '@/components/pipeline/AtsBadge';
import type { SavedJob } from '@/lib/api';

// ==============================
// Types
// ==============================
interface PipelineCardProps {
  item: SavedJob;
  onEdit: (item: SavedJob) => void;
  onDelete: (itemId: string) => void;
  isDragging?: boolean;
  dragHandlers?: any;
}

// ==============================
// Component
// ==============================
export function PipelineCard({
  item,
  onEdit,
  onDelete,
  isDragging,
  dragHandlers,
}: PipelineCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // ==============================
  // Fecha menu com ESC
  // ==============================
  useEffect(() => {
    if (!showMenu) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowMenu(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showMenu]);

  return (
    <Card
      className={`relative bg-white transition-all ${
        isDragging
          ? 'shadow-2xl rotate-2 ring-2 ring-blue-500'
          : 'hover:shadow-md hover:border-blue-300'
      }`}
    >
      <CardContent className="p-4">
        {/* ================= Header ================= */}
        <div className="flex items-start gap-2 mb-3">
          {/* Drag handle — somente título */}
          <div
            {...dragHandlers}
            className="flex-1 min-w-0 cursor-grab active:cursor-grabbing"
          >
            <h4 className="font-semibold text-sm text-gray-900 leading-snug truncate">
              {item.job.title}
            </h4>
          </div>

          {/* Menu ações — fora do drag */}
          {!isDragging && (
            <div className="relative flex-shrink-0" ref={menuRef}>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={showMenu}
                aria-label="Abrir menu de ações"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu((v) => !v);
                }}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />

                  {/* Menu */}
                  <div
                    role="menu"
                    aria-label="Ações da vaga"
                    className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1"
                  >
                    <button
                      role="menuitem"
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(item);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                    >
                      <Edit3 className="w-4 h-4" />
                      Editar
                    </button>

                    <button
                      role="menuitem"
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(item.id);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remover
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ================= Empresa + ATS ================= */}
        <div
          {...dragHandlers}
          className="flex items-center gap-2 mb-3 cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 flex-1 min-w-0">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{item.job.company.name}</span>
          </div>

          <AtsBadge type={item.job.atsType || 'unknown'} />
        </div>

        {/* ================= Detalhes ================= */}
        <div
          {...dragHandlers}
          className="grid grid-cols-2 gap-2 mb-3 cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 mr-1.5 opacity-70" />
            <span className="truncate">
              {item.job.remote ? 'Remoto' : item.job.location || 'N/A'}
            </span>
          </div>

          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
            <span className="truncate">
              {new Date(item.updatedAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>

        {/* ================= Notas ================= */}
        {item.notes && (
          <div
            {...dragHandlers}
            className="bg-yellow-50 border border-yellow-100 p-2 rounded text-xs text-gray-700 mb-3 italic cursor-grab active:cursor-grabbing"
          >
            <p className="line-clamp-2 leading-relaxed">"{item.notes}"</p>
          </div>
        )}

        {/* ================= Link ================= */}
        {!isDragging && (
          <a
            href={item.job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="border-t border-gray-100 pt-3 -mx-4 px-4 -mb-4 pb-4 flex items-center justify-center text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50/50 font-medium transition-colors rounded-b-lg"
          >
            Ver Vaga <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}

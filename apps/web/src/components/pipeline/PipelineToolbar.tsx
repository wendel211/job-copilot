'use client';

import { Search, Filter, EyeOff, Eye } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface PipelineToolbarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  hideCompleted: boolean;
  onToggleHideCompleted: () => void;
  totalItems: number;
  visibleItems: number;
}

export function PipelineToolbar({
  searchTerm,
  onSearchChange,
  hideCompleted,
  onToggleHideCompleted,
  totalItems,
  visibleItems,
}: PipelineToolbarProps) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center animate-fade-in">
      
      {/* Lado Esquerdo: Busca */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Filtrar por cargo, empresa ou notas..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
        />
      </div>

      {/* Lado Direito: Filtros e Contadores */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        <div className="text-xs text-gray-500 mr-2 hidden md:block">
          Mostrando <strong>{visibleItems}</strong> de {totalItems} vagas
        </div>

        <Button
          variant="outline"
          onClick={onToggleHideCompleted}
          className={`text-xs h-9 ${hideCompleted ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-gray-600'}`}
        >
          {hideCompleted ? (
            <>
              <Eye className="w-3.5 h-3.5 mr-2" />
              Mostrar Encerrados
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5 mr-2" />
              Ocultar Encerrados
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
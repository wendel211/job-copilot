'use client';

import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { SavedJob } from '@/lib/api';

// ==============================
// Schema
// ==============================
const editJobSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  company: z.string().min(2, 'Empresa é obrigatória'),
  notes: z.string().optional(),
});

type EditJobFormData = z.infer<typeof editJobSchema>;

interface EditJobModalProps {
  job: SavedJob;
  onClose: () => void;
  onSave: (id: string, data: { notes: string; title?: string; company?: string }) => Promise<void>;
}

// ==============================
// Component
// ==============================
export function EditJobModal({ job, onClose, onSave }: EditJobModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditJobFormData>({
    resolver: zodResolver(editJobSchema),
    defaultValues: {
      title: job.job.title,
      company: job.job.company.name,
      notes: job.notes || '',
    },
  });

  // ==============================
  // Effects — UX de modal
  // ==============================
  useEffect(() => {
    // Trava scroll do body
    document.body.style.overflow = 'hidden';

    // ESC para fechar
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  // ==============================
  // Submit
  // ==============================
  const onSubmit = async (data: EditJobFormData) => {
    try {
      await onSave(job.id, {
        notes: data.notes || '',
      });
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar alterações');
      console.error(error);
    }
  };

  // ==============================
  // Render
  // ==============================
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-job-title"
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // evita fechar ao clicar dentro
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 id="edit-job-title" className="font-bold text-lg text-gray-900">
            Editar Detalhes
          </h2>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título da Vaga
            </label>
            <input
              type="text"
              {...register('title')}
              className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 transition-all ${
                errors.title
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Empresa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empresa
            </label>
            <input
              type="text"
              {...register('company')}
              className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 transition-all ${
                errors.company
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
              }`}
            />
            {errors.company && (
              <p className="text-xs text-red-500 mt-1">{errors.company.message}</p>
            )}
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas & Anotações
            </label>
            <textarea
              {...register('notes')}
              className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none transition-all text-sm leading-relaxed"
              placeholder="Escreva detalhes sobre o processo, feedbacks, faixas salariais..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

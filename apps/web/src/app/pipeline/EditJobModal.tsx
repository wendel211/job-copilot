import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

// Schema de validação
const editJobSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  company: z.string().min(2, "Empresa é obrigatória"),
  notes: z.string().optional(),
  // Adicione campos baseados no seu Modelo de Dados [cite: 171]
});

type EditJobFormData = z.infer<typeof editJobSchema>;

export function EditJobModal({ job, onClose, onSave }: any) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EditJobFormData>({
    resolver: zodResolver(editJobSchema),
    defaultValues: {
      title: job.job.title,
      company: job.job.company.name,
      notes: job.notes || '',
    }
  });

  const onSubmit = async (data: EditJobFormData) => {
    try {
      await onSave(job.id, data);
      toast.success('Vaga atualizada com sucesso!');
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Editar Vaga</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Título</label>
            <Input {...register('title')} error={errors.title?.message} />
          </div>
          
          <div>
            <label className="text-sm font-medium">Empresa</label>
            <Input {...register('company')} error={errors.company?.message} />
          </div>

          <div>
             <label className="text-sm font-medium">Notas</label>
             <textarea 
               {...register('notes')} 
               className="w-full border rounded p-2"
               rows={3}
             />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
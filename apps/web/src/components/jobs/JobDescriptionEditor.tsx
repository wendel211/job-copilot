'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Edit3, Save, Lock, Loader2, AlertTriangle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { jobsApi } from '@/lib/api';

interface JobDescriptionEditorProps {
    jobId: string;
    initialDescription: string | null;
    descriptionEditedAt?: string | null;
    onDescriptionUpdate: (newDescription: string) => void;
}

export function JobDescriptionEditor({
    jobId,
    initialDescription,
    descriptionEditedAt,
    onDescriptionUpdate
}: JobDescriptionEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(initialDescription || '');
    const [isSaving, setIsSaving] = useState(false);

    // Bloqueado se já foi editado manualmente no passado
    const isLocked = !!descriptionEditedAt;

    useEffect(() => {
        setDescription(initialDescription || '');
        setIsEditing(false);
    }, [jobId, initialDescription]);

    const handleSave = async () => {
        if (description.trim().length < 50) {
            toast.error('A descrição deve ter pelo menos 50 caracteres.');
            return;
        }

        // Modal de confirmação (usando confirm nativo por simplicidade, ou toast com action)
        if (!window.confirm('Atenção: A descrição só pode ser editada uma única vez. Tem certeza que deseja salvar? Verifique se colou o texto correto.')) {
            return;
        }

        setIsSaving(true);
        try {
            await jobsApi.updateDescription(jobId, description.trim());
            toast.success('Descrição salva e bloqueada para edição!');
            onDescriptionUpdate(description.trim());
            setIsEditing(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao salvar descrição');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setDescription(initialDescription || '');
        setIsEditing(false);
    };

    if (isLocked) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        Sobre a vaga
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-medium uppercase tracking-wide">
                            <Lock className="w-3 h-3" /> Bloqueado
                        </span>
                    </h3>
                </div>
                <div
                    className="prose prose-blue max-w-none text-gray-600 leading-relaxed text-sm whitespace-pre-line"
                >
                    {initialDescription}
                </div>
            </div>
        );
    }

    // Estado de visualização inicial (vazio ou não editado)
    if (!isEditing) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-bold text-gray-900">Sobre a vaga</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                        <Edit3 className="w-4 h-4 mr-2" />
                        {initialDescription ? 'Editar Descrição' : 'Adicionar Descrição'}
                    </Button>
                </div>

                {initialDescription ? (
                    <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed text-sm whitespace-pre-line opacity-60">
                        {initialDescription}
                    </div>
                ) : (
                    <div
                        onClick={() => setIsEditing(true)}
                        className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 hover:border-purple-200 transition-all cursor-pointer group"
                    >
                        <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">Nenhuma descrição adicionada</p>
                        <p className="text-xs text-gray-500 text-center max-w-xs mt-1">
                            Cole a descrição completa da vaga aqui para que a IA possa analisar seu perfil.
                        </p>
                    </div>
                )}
            </div>
        );
    }

    // Estado de Edição
    return (
        <div className="bg-white p-6 rounded-xl shadow-md border-2 border-purple-100 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 mb-4 text-purple-700 font-medium">
                <Edit3 className="w-5 h-5" />
                Adicionar Descrição da Vaga
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4 flex gap-3 text-amber-800 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                    <strong>Atenção:</strong> Você só poderá salvar a descrição <u>uma única vez</u> para esta vaga.
                    Certifique-se de colar o texto completo e correto antes de confirmar.
                </p>
            </div>

            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Cole aqui o texto completo da vaga (Requisitos, Responsabilidades, etc)..."
                className="w-full h-80 p-4 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none leading-relaxed"
                autoFocus
            />

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <span className={`text-xs ${description.length < 50 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                    {description.length} caracteres (mínimo 50)
                </span>
                <div className="flex gap-3">
                    <Button variant="ghost" onClick={handleCancel} disabled={isSaving}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || description.length < 50}
                        className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200/50"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Salvar e Bloquear
                    </Button>
                </div>
            </div>
        </div>
    );
}

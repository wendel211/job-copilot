'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Edit3, Save, Lock, Loader2, AlertTriangle, FileText, X, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { jobsApi } from '@/lib/api';

// ─── Modal de Confirmação ─────────────────────────────────────────────────────
interface ConfirmSaveModalProps {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

function ConfirmSaveModal({ open, onConfirm, onCancel }: ConfirmSaveModalProps) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />

            {/* Dialog */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm animate-in fade-in zoom-in-95 duration-150">
                {/* Close */}
                <button
                    onClick={onCancel}
                    className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="p-6">
                    {/* Ícone */}
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
                        <ShieldAlert className="w-6 h-6 text-amber-500" />
                    </div>

                    {/* Título */}
                    <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                        Salvar e bloquear descrição?
                    </h3>

                    {/* Descrição */}
                    <p className="text-sm text-gray-500 leading-relaxed">
                        A descrição só pode ser editada{' '}
                        <span className="font-semibold text-gray-700">uma única vez</span>.
                        Verifique se você colou o texto correto antes de confirmar.
                    </p>
                </div>

                {/* Ações */}
                <div className="flex gap-2 px-6 pb-6">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                        Revisar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-sm shadow-emerald-200"
                    >
                        Sim, salvar
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────
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
    const [showConfirm, setShowConfirm] = useState(false);
    const confirmResolveRef = useRef<((value: boolean) => void) | null>(null);

    // Bloqueado se já foi editado manualmente no passado
    const isLocked = !!descriptionEditedAt;

    useEffect(() => {
        setDescription(initialDescription || '');
        setIsEditing(false);
    }, [jobId, initialDescription]);

    const waitForConfirm = (): Promise<boolean> =>
        new Promise((resolve) => {
            confirmResolveRef.current = resolve;
            setShowConfirm(true);
        });

    const handleConfirmYes = () => {
        setShowConfirm(false);
        confirmResolveRef.current?.(true);
    };

    const handleConfirmNo = () => {
        setShowConfirm(false);
        confirmResolveRef.current?.(false);
    };

    const handleSave = async () => {
        if (description.trim().length < 50) {
            toast.error('A descrição deve ter pelo menos 50 caracteres.');
            return;
        }

        const confirmed = await waitForConfirm();
        if (!confirmed) return;

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
                <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                    {initialDescription}
                </div>
            </div>
        );
    }

    if (!isEditing) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-bold text-gray-900">Sobre a vaga</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
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
                        className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all cursor-pointer group"
                    >
                        <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6 text-emerald-600" />
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
        <>
            <ConfirmSaveModal
                open={showConfirm}
                onConfirm={handleConfirmYes}
                onCancel={handleConfirmNo}
            />

            <div className="bg-white p-6 rounded-xl shadow-md border-2 border-emerald-100 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2 mb-4 text-emerald-700 font-semibold">
                    <Edit3 className="w-5 h-5" />
                    Adicionar Descrição da Vaga
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4 flex gap-3 text-amber-800 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                    <p>
                        <strong>Atenção:</strong> Você só poderá salvar a descrição{' '}
                        <u>uma única vez</u> para esta vaga.
                        Certifique-se de colar o texto completo e correto antes de confirmar.
                    </p>
                </div>

                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Cole aqui o texto completo da vaga (Requisitos, Responsabilidades, etc)..."
                    className="w-full h-80 p-4 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none leading-relaxed"
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
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200/50"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Salvar e Bloquear
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

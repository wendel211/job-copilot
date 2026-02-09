'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CreditCard, X, Copy, Check, Loader2, Plus } from 'lucide-react';
import { creditsApi, CreditPurchase } from '@/lib/api';
import { toast } from 'sonner';

interface CreditsDisplayProps {
    isExpanded?: boolean;
}

export function CreditsDisplay({ isExpanded = true }: CreditsDisplayProps) {
    const [credits, setCredits] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [purchase, setPurchase] = useState<CreditPurchase | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [copied, setCopied] = useState(false);

    // Carregar créditos
    useEffect(() => {
        loadCredits();
    }, []);

    const loadCredits = async () => {
        try {
            const data = await creditsApi.getCredits();
            setCredits(data.credits);
        } catch (error) {
            console.error('Erro ao carregar créditos:', error);
        }
    };

    // Iniciar compra
    const handlePurchase = async () => {
        setIsLoading(true);
        try {
            const data = await creditsApi.purchaseCredits(quantity);
            setPurchase(data);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao criar cobrança');
        } finally {
            setIsLoading(false);
        }
    };

    // Copiar código PIX
    const copyPixCode = () => {
        if (purchase?.pixCode) {
            navigator.clipboard.writeText(purchase.pixCode);
            setCopied(true);
            toast.success('Código PIX copiado!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Fechar modal e resetar
    const closeModal = () => {
        setIsModalOpen(false);
        setPurchase(null);
        loadCredits(); // Recarregar créditos após fechar
    };

    return (
        <>
            {/* Botão de Créditos */}
            <button
                onClick={() => setIsModalOpen(true)}
                className={`
          flex items-center gap-2 px-3 py-2 rounded-xl
          bg-gradient-to-r from-amber-50 to-orange-50 
          border border-amber-200/50
          text-amber-700 hover:from-amber-100 hover:to-orange-100
          transition-all duration-200
        `}
                title="Comprar créditos"
            >
                <CreditCard className="w-4 h-4" />
                <span className="text-sm font-semibold">
                    {credits !== null ? credits : '...'}
                </span>
                {isExpanded && (
                    <span className="text-xs text-amber-600">créditos</span>
                )}
            </button>

            {/* Modal de Compra */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={closeModal}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto my-auto flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Comprar Créditos</h2>
                                    <p className="text-sm text-gray-500">R$5,00 por importação</p>
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5 overflow-y-auto">
                            {!purchase ? (
                                /* Seleção de Quantidade */
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Quantidade de créditos
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                                            >
                                                -
                                            </button>
                                            <span className="text-2xl font-bold text-gray-900 w-16 text-center">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={() => setQuantity(quantity + 1)}
                                                className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Resumo */}
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Total a pagar</span>
                                            <span className="text-2xl font-bold text-gray-900">
                                                R$ {(quantity * 5).toFixed(2).replace('.', ',')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Botão de Compra */}
                                    <button
                                        onClick={handlePurchase}
                                        disabled={isLoading}
                                        className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Gerando PIX...
                                            </>
                                        ) : (
                                            'Pagar com PIX'
                                        )}
                                    </button>
                                </div>
                            ) : (
                                /* QR Code PIX */
                                <div className="space-y-4">
                                    <div className="text-center">
                                        {/* Case 1: Tem QR Code e PIX Code */}
                                        {purchase.pixQrCode && (
                                            <>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    Escaneie o QR Code ou copie o código PIX
                                                </p>
                                                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 flex justify-center mb-4">
                                                    <img
                                                        src={purchase.pixQrCode}
                                                        alt="QR Code PIX"
                                                        className="w-full max-w-[240px] h-auto object-contain"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* Case 2: Só tem PIX Code (copia e cola) */}
                                        {purchase.pixCode && (
                                            <div
                                                onClick={copyPixCode}
                                                className="flex items-center gap-2 bg-gray-100 rounded-lg p-3 cursor-pointer hover:bg-gray-200 transition-colors mb-4"
                                            >
                                                <code className="text-xs text-gray-600 truncate flex-1 text-left">
                                                    {purchase.pixCode?.slice(0, 50)}...
                                                </code>
                                                {copied ? (
                                                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                                                ) : (
                                                    <Copy className="w-5 h-5 text-gray-400 shrink-0" />
                                                )}
                                            </div>
                                        )}

                                        {/* Case 3: Só tem URL de pagamento (fallback) */}
                                        {purchase.paymentUrl && !purchase.pixQrCode && !purchase.pixCode && (
                                            <div className="space-y-3">
                                                <p className="text-sm text-gray-600">
                                                    Clique no botão abaixo para pagar via PIX
                                                </p>
                                                <a
                                                    href={purchase.paymentUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-block w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all text-center"
                                                >
                                                    Abrir Página de Pagamento
                                                </a>
                                            </div>
                                        )}

                                        {/* Sempre mostra botão para abrir URL se disponível */}
                                        {purchase.paymentUrl && (purchase.pixQrCode || purchase.pixCode) && (
                                            <a
                                                href={purchase.paymentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-emerald-600 hover:text-emerald-700 underline"
                                            >
                                                Ou clique aqui para abrir página de pagamento
                                            </a>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="bg-amber-50 rounded-xl p-3 text-center">
                                        <p className="text-sm text-amber-700">
                                            Após o pagamento, seus créditos serão adicionados automaticamente.
                                        </p>
                                    </div>

                                    {/* Botão Fechar */}
                                    <button
                                        onClick={closeModal}
                                        className="w-full py-3 px-4 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Já paguei, verificar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

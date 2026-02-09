'use client';

import { X, CreditCard } from 'lucide-react';
import { PricingPlans } from './PricingPlans';

interface CreditsModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
}

export function CreditsModal({
    isOpen,
    onClose,
    title = "Comprar Créditos",
    description = "Adquira mais créditos para continuar importando vagas com IA."
}: CreditsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-100">
                            <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                            <p className="text-sm text-gray-500">{description}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content - Pricing Plans */}
                <div className="p-2 sm:p-6 bg-gray-50/50">
                    <PricingPlans embedded compact onPurchaseSuccess={onClose} />

                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-400">
                            Pagamento processado seguramente via PIX. Créditos liberados imediatamente.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

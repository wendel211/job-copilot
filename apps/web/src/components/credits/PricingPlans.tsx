'use client';

import { useState } from 'react';
import { Check, Sparkles, Zap, Crown, CreditCard, Loader2 } from 'lucide-react';
import { creditsApi } from '@/lib/api';
import { toast } from 'sonner';

interface Plan {
    id: string;
    name: string;
    description: string;
    price: number;
    credits: number;
    pricePerCredit?: number;
    features: string[];
    icon: React.ReactNode;
    popular?: boolean;
    buttonText: string;
    gradient: string;
    iconBg: string;
}

const plans: Plan[] = [
    {
        id: 'free',
        name: 'Gratuito',
        description: 'Explore a plataforma',
        price: 0,
        credits: 0,
        features: [
            'Acesso completo à plataforma',
            'Gerenciamento de pipeline',
            'Acompanhamento de candidaturas',
            'Perfil profissional',
        ],
        icon: <CreditCard className="w-6 h-6" />,
        buttonText: 'Plano Atual',
        gradient: 'from-gray-100 to-gray-200',
        iconBg: 'bg-gray-500',
    },
    {
        id: 'single',
        name: 'Avulso',
        description: 'Pague por uso',
        price: 5,
        credits: 1,
        pricePerCredit: 5,
        features: [
            '1 importação de vaga',
            'Sem compromisso mensal',
            'Ideal para testar',
            'Pagamento único via PIX',
        ],
        icon: <Zap className="w-6 h-6" />,
        buttonText: 'Comprar 1 Crédito',
        gradient: 'from-amber-50 to-orange-100',
        iconBg: 'bg-amber-500',
    },
    {
        id: 'starter',
        name: 'Starter',
        description: 'Para quem está começando',
        price: 19.99,
        credits: 10,
        pricePerCredit: 2,
        features: [
            '10 importações de vagas',
            'Economia de 60%',
            'Match de IA com vagas',
            'Suporte por email',
        ],
        icon: <Sparkles className="w-6 h-6" />,
        popular: true,
        buttonText: 'Comprar 10 Créditos',
        gradient: 'from-blue-50 to-indigo-100',
        iconBg: 'bg-blue-600',
    },
    {
        id: 'pro',
        name: 'Pro',
        description: 'Máximo aproveitamento',
        price: 59.90,
        credits: 50,
        pricePerCredit: 1.2,
        features: [
            '50 importações de vagas',
            'Economia de 76%',
            'Match de IA avançado',
            'Suporte prioritário',
        ],
        icon: <Crown className="w-6 h-6" />,
        buttonText: 'Comprar 50 Créditos',
        gradient: 'from-purple-50 to-pink-100',
        iconBg: 'bg-purple-600',
    },
];

interface PricingPlansProps {
    onPurchaseSuccess?: () => void;
    embedded?: boolean;
    compact?: boolean;
}

export function PricingPlans({ onPurchaseSuccess, embedded = false, compact = false }: PricingPlansProps) {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [pixData, setPixData] = useState<{
        brCode: string;
        qrCode: string;
        planName: string;
    } | null>(null);

    const handlePurchase = async (plan: Plan) => {
        if (plan.id === 'free') return;

        setLoadingPlan(plan.id);
        try {
            const data = await creditsApi.purchaseCredits(plan.credits);
            setPixData({
                brCode: data.pixCode,
                qrCode: data.pixQrCode,
                planName: plan.name,
            });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao gerar PIX');
        } finally {
            setLoadingPlan(null);
        }
    };

    const copyPixCode = () => {
        if (pixData?.brCode) {
            navigator.clipboard.writeText(pixData.brCode);
            toast.success('Código PIX copiado!');
        }
    };

    // Modal de PIX
    if (pixData) {
        return (
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">PIX Gerado!</h2>
                    <p className="text-gray-600 mt-1">Plano {pixData.planName}</p>
                </div>

                {/* QR Code */}
                {pixData.qrCode && (
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 flex justify-center mb-4">
                        <img
                            src={pixData.qrCode}
                            alt="QR Code PIX"
                            className="w-56 h-56 object-contain"
                        />
                    </div>
                )}

                {/* Código copia e cola */}
                <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2 text-center">Ou copie o código PIX:</p>
                    <div
                        onClick={copyPixCode}
                        className="bg-gray-100 rounded-lg p-3 cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                        <code className="text-xs text-gray-700 break-all">
                            {pixData.brCode}
                        </code>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={copyPixCode}
                        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all"
                    >
                        Copiar Código PIX
                    </button>
                    <button
                        onClick={() => {
                            setPixData(null);
                            onPurchaseSuccess?.();
                        }}
                        className="w-full py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Já paguei, verificar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={compact ? "py-2" : "py-8"}>
            {/* Header */}
            {!embedded && (
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        Escolha seu Plano de Créditos
                    </h1>
                    <p className="text-gray-600 max-w-xl mx-auto">
                        Cada crédito permite importar uma vaga. Quanto mais créditos, maior o desconto!
                    </p>
                </div>
            )}

            {/* Plans Grid */}
            <div className={`
                ${compact
                    ? 'grid grid-cols-2 lg:grid-cols-4 gap-3 px-1'
                    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4'}
            `}>
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`
                            relative bg-gradient-to-br ${plan.gradient} 
                            rounded-2xl border-2 
                            ${compact ? 'p-3' : 'p-6'}
                            ${plan.popular ? 'border-blue-400 shadow-xl shadow-blue-100' : 'border-transparent'}
                            transition-all duration-300 hover:scale-105 hover:shadow-xl
                        `}
                    >
                        {/* Popular Badge */}
                        {plan.popular && (
                            <div className={`absolute left-1/2 -translate-x-1/2 ${compact ? '-top-2' : '-top-3'}`}>
                                <span className={`bg-blue-600 text-white font-bold rounded-full ${compact ? 'text-[10px] px-2 py-0.5' : 'text-xs px-4 py-1'}`}>
                                    MAIS POPULAR
                                </span>
                            </div>
                        )}

                        {/* Icon */}
                        <div className={`
                            ${plan.iconBg} rounded-xl flex items-center justify-center text-white mb-3
                            ${compact ? 'w-8 h-8' : 'w-12 h-12 mb-4'}
                        `}>
                            {compact ? (
                                <div className="scale-75">{plan.icon}</div>
                            ) : (
                                plan.icon
                            )}
                        </div>

                        {/* Name & Description */}
                        <h3 className={`font-bold text-gray-900 ${compact ? 'text-sm' : 'text-xl'}`}>{plan.name}</h3>
                        {!compact && <p className="text-gray-600 text-sm mb-4">{plan.description}</p>}

                        {/* Price */}
                        <div className={compact ? "mb-2" : "mb-4"}>
                            <div className="flex items-baseline gap-1">
                                <span className="text-sm text-gray-500">R$</span>
                                <span className={`font-bold text-gray-900 ${compact ? 'text-2xl' : 'text-4xl'}`}>
                                    {plan.price === 0 ? '0' : plan.price.toFixed(2).replace('.', ',')}
                                </span>
                            </div>
                            {plan.pricePerCredit && (
                                <p className={`text-gray-500 mt-1 ${compact ? 'text-xs' : 'text-sm'}`}>
                                    R${plan.pricePerCredit.toFixed(2).replace('.', ',')} / crédito
                                </p>
                            )}
                            {plan.credits > 0 && (
                                <p className={`font-medium text-emerald-600 mt-1 ${compact ? 'text-xs' : 'text-sm'}`}>
                                    {plan.credits} crédito{plan.credits > 1 ? 's' : ''}
                                </p>
                            )}
                        </div>

                        {/* Features - Hide in compact mode to save space, or show fewer */}
                        {!compact && (
                            <ul className="space-y-2 mb-6">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Button */}
                        <button
                            onClick={() => handlePurchase(plan)}
                            disabled={plan.id === 'free' || loadingPlan === plan.id}
                            className={`
                                w-full rounded-xl font-semibold transition-all
                                flex items-center justify-center gap-2
                                ${compact ? 'py-1.5 text-xs' : 'py-3'}
                                ${plan.id === 'free'
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : plan.popular
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50'
                                }
                                disabled:opacity-60
                            `}
                        >
                            {loadingPlan === plan.id ? (
                                <>
                                    <Loader2 className={`animate-spin ${compact ? 'w-3 h-3' : 'w-5 h-5'}`} />
                                    {compact ? '...' : 'Gerando PIX...'}
                                </>
                            ) : (
                                plan.buttonText
                            )}
                        </button>
                    </div>
                ))}
            </div>

            {/* Footer Note */}
            {!embedded && (
                <div className="text-center mt-8">
                    <p className="text-sm text-gray-500">
                        Pagamento seguro via PIX • Créditos não expiram • Cancele quando quiser
                    </p>
                </div>
            )}
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { aiApi } from '@/lib/api';
import {
    Loader2,
    ArrowLeft,
    Sparkles,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Copy,
    Search,
    Brain,
    FileText,
    TrendingUp,
    ShieldAlert,
    ShieldCheck,
    Target,
    Zap,
    Award
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AtsScannerPage() {
    const params = useParams();
    const jobId = params.id as string;
    const { user } = useAppStore();

    // States
    const [isLoading, setIsLoading] = useState(true);
    const [loadingStep, setLoadingStep] = useState(0);
    const [report, setReport] = useState<any>(null);

    // Premium loading steps
    const loadingSteps = [
        { text: 'Conectando ao banco de talentos...', icon: Search, color: 'text-blue-400' },
        { text: 'Extraindo palavras-chave da vaga...', icon: FileText, color: 'text-emerald-400' },
        { text: 'Analisando compatibilidade do perfil...', icon: Brain, color: 'text-purple-400' },
        { text: 'Identificando gaps e oportunidades...', icon: AlertTriangle, color: 'text-amber-400' },
        { text: 'Calculando score ATS...', icon: Target, color: 'text-red-400' },
        { text: 'Gerando relatório final...', icon: Sparkles, color: 'text-pink-400' },
    ];

    useEffect(() => {
        const loadData = async () => {
            if (!user?.id || !jobId) return;

            let step = 0;
            const interval = setInterval(() => {
                step++;
                if (step < loadingSteps.length) {
                    setLoadingStep(step);
                }
            }, 700);

            try {
                const analysisResult = await aiApi.analyzeMatch(user.id, jobId);

                setTimeout(() => {
                    clearInterval(interval);
                    setReport(analysisResult);
                    setIsLoading(false);
                }, 4500);

            } catch (error) {
                clearInterval(interval);
                console.error(error);
                toast.error('Erro ao carregar análise ATS.');
                setIsLoading(false);
            }
        };

        loadData();
    }, [user?.id, jobId]);

    // ==================== LOADING SCREEN ====================
    if (isLoading) {
        const CurrentIcon = loadingSteps[loadingStep]?.icon || Loader2;
        // Text Colors adapted for white background - darker shades
        const currentColor = loadingSteps[loadingStep]?.color?.replace('-400', '-600') || 'text-emerald-600';
        const progress = ((loadingStep + 1) / loadingSteps.length) * 100;

        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-900 relative overflow-hidden">
                {/* Background Effects - Subtle and Clean */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-50/50 via-white to-white"></div>
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-100 to-transparent"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto px-6">
                    {/* Animated Icon Container */}
                    <div className="relative mb-8">
                        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-100 border border-emerald-50">
                            <CurrentIcon className={`w-10 h-10 ${currentColor} transition-all duration-500`} />
                        </div>
                        {/* Orbiting dots - Adapted colors */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                        <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-teal-400 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
                    </div>

                    <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent drop-shadow-sm mb-3 text-center">
                        Ajusta.ai
                    </h2>
                    <p className="text-sm text-gray-500 mb-10 text-center font-medium">
                        Otimizando seu perfil com inteligência artificial...
                    </p>

                    {/* Current Step */}
                    <div className="flex flex-col items-center gap-4 w-full px-8">
                        <p className="text-sm text-gray-600 font-medium text-center transition-all duration-300 h-5">
                            {loadingSteps[loadingStep]?.text || 'Processando...'}
                        </p>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-green-400 rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>

                        {/* Step Dots */}
                        <div className="flex gap-1.5 mt-2">
                            {loadingSteps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === loadingStep
                                        ? 'bg-emerald-500 scale-125'
                                        : idx < loadingStep
                                            ? 'bg-emerald-200'
                                            : 'bg-gray-200'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!report) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <XCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Não foi possível gerar o relatório.</p>
                <Link href={`/jobs/${jobId}`}>
                    <Button variant="outline">Voltar para a vaga</Button>
                </Link>
            </div>
        </div>
    );

    // ==================== HELPERS ====================
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-500';
        if (score >= 60) return 'text-amber-500';
        return 'text-red-500';
    };

    const getScoreGradient = (score: number) => {
        if (score >= 80) return 'from-emerald-500 to-green-400';
        if (score >= 60) return 'from-amber-500 to-yellow-400';
        return 'from-red-500 to-orange-400';
    };

    const getRiskBadge = () => {
        const risk = report.riskLevel || (report.score >= 60 ? 'BAIXO' : 'ALTO');
        const config: Record<string, { label: string; bg: string; text: string; icon: any }> = {
            'BAIXO': { label: 'APROVAR', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: ShieldCheck },
            'MÉDIO': { label: 'ATENÇÃO', bg: 'bg-amber-100', text: 'text-amber-700', icon: ShieldAlert },
            'ALTO': { label: 'REPROVAR', bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
        };
        const c = config[risk] || config['ALTO'];
        const Icon = c.icon;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
                <Icon className="w-3.5 h-3.5" />
                {c.label}
            </span>
        );
    };

    const scoreBarData = [
        { label: 'Hard Skills', value: report.breakdown.hardSkills, max: 40, color: 'bg-blue-500', bgColor: 'bg-blue-100' },
        { label: 'Experiência', value: report.breakdown.experience, max: 30, color: 'bg-amber-500', bgColor: 'bg-amber-100' },
        { label: 'Palavras-chave', value: report.breakdown.keywords, max: 20, color: 'bg-emerald-500', bgColor: 'bg-emerald-100' },
    ];

    // ==================== RESULTS SCREEN ====================
    return (
        <div className="min-h-screen bg-slate-50 relative pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/jobs/${jobId}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 tracking-tight">ATS Scanner</span>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase rounded-full">Pro</span>
                        </div>
                    </div>
                    <Link href={`/jobs/${jobId}/analysis`} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Novo Teste
                    </Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* ====== TOP SECTION: Score + Composition ====== */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">

                    {/* Main Score Card */}
                    <div className="lg:col-span-3 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500"></div>

                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-1">Resultado da Análise</h2>
                                <p className="text-xs text-gray-400">Baseado nos critérios de +50 ATS do mercado</p>
                            </div>
                            {getRiskBadge()}
                        </div>

                        <div className="flex items-end gap-6 mb-6">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Score Geral</p>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-6xl font-black ${getScoreColor(report.score)} tracking-tight`}>
                                        {report.score}
                                    </span>
                                    <span className="text-xl text-gray-300 font-medium">/100</span>
                                </div>
                            </div>
                            <div className="mb-2">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Classificação</p>
                                <p className="text-lg font-bold text-gray-900">{report.classification}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <span className={`w-2 h-2 rounded-full ${report.riskLevel === 'ALTO' ? 'bg-red-500' : report.riskLevel === 'MÉDIO' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                                    Risco de Rejeição: <strong>{report.riskLevel || 'N/A'}</strong>
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100">
                            {report.feedback}
                        </p>
                    </div>

                    {/* Score Composition */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            Composição da Nota
                        </h3>
                        <div className="space-y-5">
                            {scoreBarData.map((bar) => {
                                const displayValue = Math.round((bar.value / 100) * bar.max * 10) / 10;
                                return (
                                    <div key={bar.label}>
                                        <div className="flex justify-between mb-1.5">
                                            <span className="text-sm font-medium text-gray-600">{bar.label}</span>
                                            <span className="text-sm font-bold text-gray-900">{displayValue}/{bar.max}</span>
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${bar.color} rounded-full transition-all duration-1000 ease-out`}
                                                style={{ width: `${bar.value}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Chance */}
                        <div className="mt-6 pt-5 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Chance de Passar</span>
                                <span className={`text-sm font-bold ${getScoreColor(report.score)}`}>
                                    {report.chanceOfPassing}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ====== MIDDLE SECTION: Gaps + Strengths ====== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                    {/* Gaps Críticos */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            Gaps Críticos
                        </h3>
                        <ul className="space-y-3">
                            {report.gaps?.length > 0 ? report.gaps.map((gap: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700">
                                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                    <span>{gap}</span>
                                </li>
                            )) : (
                                <li className="text-sm text-gray-400 italic">Nenhum gap crítico identificado.</li>
                            )}
                        </ul>
                    </div>

                    {/* Pontos Fortes */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Award className="w-4 h-4 text-emerald-500" />
                            Pontos Fortes
                        </h3>
                        <ul className="space-y-3">
                            {report.strengths?.length > 0 ? report.strengths.map((s: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <span>{s}</span>
                                </li>
                            )) : (
                                <li className="text-sm text-gray-400 italic">Nenhum ponto forte identificado.</li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* ====== KEYWORDS SECTION ====== */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
                    <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Palavras-chave Ausentes
                    </h3>
                    <p className="text-xs text-gray-400 mb-4">Termos importantes da vaga que não foram encontrados no seu CV.</p>

                    <div className="flex flex-wrap gap-2 mb-6">
                        {report.keywords.missing.length > 0 ? report.keywords.missing.map((wd: string) => (
                            <span key={wd} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors">
                                {wd}
                            </span>
                        )) : <span className="text-sm text-gray-400 italic">Nenhuma palavra importante faltando. 🎉</span>}
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Termos encontrados (Match)</p>
                        <div className="flex flex-wrap gap-2">
                            {report.keywords.found.length > 0 ? report.keywords.found.map((wd: string) => (
                                <span key={wd} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-xs font-semibold">
                                    {wd}
                                </span>
                            )) : <span className="text-sm text-gray-400 italic">Nenhuma palavra encontrada.</span>}
                        </div>
                    </div>
                </div>

                {/* ====== BOTTOM SECTION: Optimization + Adapted Resume ====== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Optimization Points */}
                    <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 shadow-sm border border-purple-100">
                        <h3 className="text-sm font-bold text-purple-900 mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-purple-600" />
                            Pontos de Otimização
                        </h3>
                        <ul className="space-y-3">
                            {report.optimizationPoints?.map((point: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700">
                                    <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                        <span className="text-xs font-bold text-purple-600">{idx + 1}</span>
                                    </div>
                                    <span>{point}</span>
                                </li>
                            ))}
                            {(!report.optimizationPoints || report.optimizationPoints.length === 0) && (
                                <li className="text-sm text-gray-400 italic">Nenhum ponto de otimização identificado.</li>
                            )}
                        </ul>
                    </div>

                    {/* Adapted Resume */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-600" />
                                Versão Otimizada do CV
                            </h3>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs"
                                onClick={() => { navigator.clipboard.writeText(report.adaptedResume || ''); toast.success('Copiado!') }}
                            >
                                <Copy className="w-3 h-3 mr-1.5" />
                                Copiar
                            </Button>
                        </div>

                        <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
                            {report.adaptedResume ? (
                                <textarea
                                    readOnly
                                    className="w-full h-full min-h-[260px] bg-transparent resize-none text-xs font-mono text-gray-600 focus:outline-none"
                                    value={report.adaptedResume}
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 italic text-sm">
                                    Nenhuma sugestão gerada.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

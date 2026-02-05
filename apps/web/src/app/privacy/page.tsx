'use client';

import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Eye, Share2, Cookie, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 w-full shadow-sm">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                            JobCopilot
                        </span>
                    </div>
                    <Link href="/login">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-gray-600 hover:text-emerald-600 border-gray-200 hover:border-emerald-200"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar ao Login
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12">
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">

                    {/* Hero Section */}
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 sm:p-12 border-b border-emerald-100">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6">
                            <Lock className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Política de Privacidade
                        </h1>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            Tratamos seus dados com transparência e responsabilidade. Esta política detalha como coletamos, usamos e protegemos suas informações, conforme a <strong>Lei Geral de Proteção de Dados (LGPD)</strong>.
                        </p>
                        <div className="flex items-center gap-2 mt-6 text-sm text-emerald-700 bg-emerald-100/50 w-fit px-3 py-1.5 rounded-full font-medium border border-emerald-200">
                            <ShieldCheck className="w-4 h-4" />
                            Última atualização: 05 de Fevereiro de 2026
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 sm:p-12 space-y-12">

                        {/* 1. Dados Coletados */}
                        <section>
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-6 group">
                                <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500 font-mono group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">01</span>
                                Dados que Coletamos
                            </h2>
                            <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
                                <p>
                                    Para fornecer nossos serviços de análise de carreira e match de vagas, coletamos as seguintes categorias de dados:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 mt-2">
                                    <li><strong>Dados de Identificação:</strong> Nome, e-mail, telefone e informações de login.</li>
                                    <li><strong>Dados Profissionais:</strong> Currículo completo (PDF/Docx), histórico profissional, competências, formação acadêmica e links para portfólios.</li>
                                    <li><strong>Dados de Uso:</strong> Informações sobre como você navega na plataforma, vagas visualizadas e candidaturas realizadas.</li>
                                </ul>
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* 2. Uso dos Dados */}
                        <section>
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-6 group">
                                <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500 font-mono group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">02</span>
                                Como Usamos seus Dados
                            </h2>
                            <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
                                <p>
                                    A base legal para o tratamento de seus dados é a <strong>execução de contrato</strong> e o <strong>legítimo interesse</strong>. Utilizamos as informações para:
                                </p>
                                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <h4 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                                            <Eye className="w-4 h-4 text-emerald-600" />
                                            Análise de Perfil
                                        </h4>
                                        <p className="text-sm">Processamento de inteligência artificial para identificar seus pontos fortes e compatibilidade com vagas.</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <h4 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                                            <Share2 className="w-4 h-4 text-emerald-600" />
                                            Match de Vagas
                                        </h4>
                                        <p className="text-sm">Recomendação personalizada de oportunidades que se encaixam no seu momento de carreira.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* 3. Compartilhamento */}
                        <section>
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-6 group">
                                <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500 font-mono group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">03</span>
                                Compartilhamento
                            </h2>
                            <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
                                <p>
                                    Seus dados pessoais não são vendidos. Compartilhamos informações apenas com:
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>Provedores de Infraestrutura:</strong> Serviços de nuvem e segurança (ex: AWS, Google Cloud).</li>
                                    <li><strong>Recrutadores:</strong> Apenas quando você opta ativamente por se candidatar a uma vaga específica.</li>
                                </ul>
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* 4. Cookies */}
                        <section>
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-6 group">
                                <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500 font-mono group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">04</span>
                                Cookies e Tecnologias
                            </h2>
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-4">
                                <h3 className="text-blue-900 font-semibold flex items-center gap-2 mb-2">
                                    <Cookie className="w-4 h-4" />
                                    Política de Cookies
                                </h3>
                                <p className="text-sm text-blue-800">
                                    Utilizamos cookies essenciais para autenticação e cookies analíticos para entender como você usa a plataforma. Você pode gerenciar suas preferências nas configurações do seu navegador.
                                </p>
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* 5. Seus Direitos */}
                        <section>
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-6 group">
                                <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500 font-mono group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">05</span>
                                Seus Direitos (LGPD)
                            </h2>
                            <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
                                <p>
                                    Você tem controle total sobre seus dados. A qualquer momento você pode solicitar:
                                </p>
                                <ul className="grid sm:grid-cols-2 gap-3 mt-3">
                                    <li className="flex items-start gap-2 text-sm bg-gray-50 p-3 rounded-lg"><UserCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> Acesso e Cópia dos Dados.</li>
                                    <li className="flex items-start gap-2 text-sm bg-gray-50 p-3 rounded-lg"><UserCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> Portabilidade de Dados.</li>
                                    <li className="flex items-start gap-2 text-sm bg-gray-50 p-3 rounded-lg"><UserCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> Retificação de Informações.</li>
                                    <li className="flex items-start gap-2 text-sm bg-gray-50 p-3 rounded-lg"><UserCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> Anonimização ou Bloqueio.</li>
                                </ul>
                            </div>
                        </section>

                        {/* Contact Box */}
                        <div className="bg-gray-900 rounded-2xl p-8 text-center text-white mt-12">
                            <h3 className="text-xl font-bold mb-3">Exercer seus direitos?</h3>
                            <p className="text-gray-300 mb-6 max-w-lg mx-auto">
                                Para solicitar acesso, exclusão ou qualquer outra demanda relacionada à privacidade, entre em contato com nosso DPO.
                            </p>
                            <Link href="mailto:privacy@jobcopilot.com">
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold border-none px-8 py-6 h-auto text-base shadow-lg shadow-emerald-900/20">
                                    Contatar DPO (privacy@jobcopilot.com)
                                </Button>
                            </Link>
                        </div>

                    </div>
                </div>

                <p className="text-center text-gray-500 text-sm mt-12">
                    &copy; {new Date().getFullYear()} JobCopilot Tecnologia Ltda. Todos os direitos reservados.
                </p>
            </main>
        </div>
    );
}

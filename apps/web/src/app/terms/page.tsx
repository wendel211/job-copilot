'use client';

import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, FileText, Scale, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function TermsPage() {
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
                            <Scale className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Termos de Uso e Privacidade
                        </h1>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            Sua confiança é fundamental para nós. Entenda como protegemos seus dados e quais são seus direitos e deveres ao utilizar nossa plataforma, em conformidade com a <strong>LGPD</strong>.
                        </p>
                        <div className="flex items-center gap-2 mt-6 text-sm text-emerald-700 bg-emerald-100/50 w-fit px-3 py-1.5 rounded-full font-medium border border-emerald-200">
                            <ShieldCheck className="w-4 h-4" />
                            Última atualização: 05 de Fevereiro de 2026
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 sm:p-12 space-y-12">

                        {/* 1. Introdução */}
                        <section>
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-6 group">
                                <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500 font-mono group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">01</span>
                                Introdução
                            </h2>
                            <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
                                <p>
                                    Bem-vindo ao JobCopilot. Estes Termos de Uso e Política de Privacidade ("Termos") regulam o acesso e uso da plataforma JobCopilot e seus serviços relacionados.
                                </p>
                                <p>
                                    Ao criar uma conta ou utilizar nossos serviços, você concorda expressamente com estes Termos. Se você não concordar com qualquer disposição, por favor, não utilize a plataforma.
                                </p>
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* 2. Política de Privacidade (LGPD) */}
                        <section>
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-6 group">
                                <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500 font-mono group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">02</span>
                                Privacidade e Dados (LGPD)
                            </h2>
                            <div className="prose prose-gray max-w-none text-gray-600 space-y-6">
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                                    <h3 className="text-blue-900 font-semibold flex items-center gap-2 mb-2">
                                        <Lock className="w-4 h-4" />
                                        Compromisso com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
                                    </h3>
                                    <p className="text-sm text-blue-800">
                                        O JobCopilot atua como <strong>Controlador</strong> e <strong>Operador</strong> de dados pessoais, comprometendo-se a garantir a privacidade, segurança e transparência no tratamento de suas informações.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">2.1. Dados Coletados</h3>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li><strong>Dados Pessoais:</strong> Nome completo, e-mail, telefone, endereço.</li>
                                        <li><strong>Dados Profissionais:</strong> Histórico educacional, experiências profissionais, currículos (CVs), portfólios e links de perfis sociais (LinkedIn).</li>
                                        <li><strong>Dados de Uso:</strong> Logs de acesso, interações com a plataforma e preferências de vagas.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">2.2. Finalidade do Tratamento</h3>
                                    <p>Utilizamos seus dados estritamente para:</p>
                                    <ul className="list-disc pl-5 space-y-2 mt-2">
                                        <li>Fornecer o serviço de análise de currículo e match de vagas via Inteligência Artificial.</li>
                                        <li>Melhorar nossos algoritmos de recomendação.</li>
                                        <li>Comunicar novidades, atualizações de segurança e suporte.</li>
                                        <li>Cumprir obrigações legais e regulatórias.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">2.3. Seus Direitos (Titular dos Dados)</h3>
                                    <p>Conforme a LGPD, você tem direito a:</p>
                                    <ul className="grid sm:grid-cols-2 gap-3 mt-3">
                                        <li className="flex items-start gap-2 text-sm bg-gray-50 p-3 rounded-lg"><UserCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> Confirmação da existência de tratamento.</li>
                                        <li className="flex items-start gap-2 text-sm bg-gray-50 p-3 rounded-lg"><UserCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> Acesso aos dados.</li>
                                        <li className="flex items-start gap-2 text-sm bg-gray-50 p-3 rounded-lg"><UserCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> Correção de dados incompletos ou desatualizados.</li>
                                        <li className="flex items-start gap-2 text-sm bg-gray-50 p-3 rounded-lg"><UserCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> Revogação do consentimento e eliminação dos dados.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* 3. Uso da Plataforma */}
                        <section>
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-6 group">
                                <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500 font-mono group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">03</span>
                                Uso da Plataforma
                            </h2>
                            <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
                                <p>
                                    O JobCopilot concede a você uma licença limitada, não exclusiva e intransferível para usar nossos serviços. Você concorda em não utilizar a plataforma para fins ilegais ou não autorizados.
                                </p>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Responsabilidades do Usuário</h3>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>Manter a confidencialidade de suas credenciais de acesso.</li>
                                        <li>Fornecer informações verdadeiras, exatas e atualizadas.</li>
                                        <li>Não realizar engenharia reversa ou tentar comprometer a segurança da plataforma.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* 4. Propriedade Intelectual */}
                        <section>
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-6 group">
                                <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500 font-mono group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">04</span>
                                Segurança e Retenção
                            </h2>
                            <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
                                <p>
                                    Adotamos medidas técnicas e administrativas aptas a proteger os dados pessoais de acessos não autorizados e de situações acidentais ou ilícitas de destruição, perda, alteração, comunicação ou difusão.
                                </p>
                                <p>
                                    Utilizamos criptografia de ponta a ponta para dados sensíveis e parcerias com provedores de nuvem certificados (AWS/Google Cloud) que seguem padrões internacionais de segurança (ISO 27001).
                                </p>
                            </div>
                        </section>

                        {/* Contact Box */}
                        <div className="bg-gray-900 rounded-2xl p-8 text-center text-white mt-12">
                            <h3 className="text-xl font-bold mb-3">Dúvidas sobre seus dados?</h3>
                            <p className="text-gray-300 mb-6 max-w-lg mx-auto">
                                Nosso Encarregado de Proteção de Dados (DPO) está à disposição para atender suas solicitações referentes à LGPD.
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

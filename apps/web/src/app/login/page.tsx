'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { toast } from 'sonner';
import { Check, Star, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authApi.login(form.email, form.password);
      setAuth({ user: response.user, access_token: response.access_token });
      toast.success(`Bem-vindo, ${response.user.fullName || 'Usuário'}!`);
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error('Verifique suas credenciais e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden font-sans bg-white selection:bg-emerald-100 selection:text-emerald-900">

      {/* ====================================================================================
          LADO ESQUERDO: Features & Value Proposition (Polished & Spacious)
         ==================================================================================== */}
      <div className="hidden lg:flex w-[60%] relative bg-[#042f2e] text-white flex-col overflow-hidden transition-all ease-in-out duration-500">

        {/* Living Background (Fixed Layer) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 mix-blend-overlay"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[100px]"></div>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>

        {/* Content Container (Flexbox for perfect spacing) */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-12 xl:p-16">

          {/* 1. Header Area */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg">
              <Zap className="w-5 h-5 text-emerald-300 fill-emerald-300" />
            </div>
          </div>

          {/* 2. Main Center Content */}
          <div className="flex flex-col justify-center gap-8 max-w-2xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-5 backdrop-blur-md">
                <Star className="w-3 h-3 fill-emerald-300" />
                Plataforma #1 para Vagas
              </div>
              <h1 className="text-5xl xl:text-6xl font-bold leading-[1.1] mb-5 tracking-tight text-white">
                Sua carreira,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-teal-400">
                  no próximo nível.
                </span>
              </h1>
              <p className="text-lg text-emerald-100/70 font-light leading-relaxed max-w-lg">
                Centralize sua busca, otimize seu CV com IA e organize cada etapa do seu processo seletivo em um único lugar.
              </p>
            </div>

            <div className="space-y-4">
              <FeatureRow
                icon={<Zap className="w-5 h-5 text-emerald-300" />}
                title="Inteligência Artificial Real"
                desc="Adaptação automática de perfil para cada vaga."
              />
              <FeatureRow
                icon={<ShieldCheck className="w-5 h-5 text-emerald-300" />}
                title="Gestão Visual (Kanban)"
                desc="Controle total de suas candidaturas e entrevistas."
              />
            </div>
          </div>

          {/* 3. Footer / Testimonial */}
          <div>
            <div className="bg-white/5 backdrop-blur-md border-l-4 border-emerald-500 pl-5 py-3 rounded-r-xl max-w-lg">
              <p className="text-emerald-50 italic text-base">"Muito mais que um buscador de vagas. É um sistema completo de gestão de carreira."</p>
            </div>
          </div>

        </div>
      </div>

      {/* ====================================================================================
          LADO DIREITO: Login Form (Compact & Fitted)
         ==================================================================================== */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center items-center p-8 bg-slate-50 relative overflow-hidden">

        <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-right-4 duration-700 flex flex-col h-full justify-center">

          <div className="mb-8 pl-1">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Bem-vindo de volta</h2>
            <p className="text-slate-500 mt-2 text-sm font-medium">Acesse o painel inteligente da sua carreira.</p>
          </div>

          {/* Google Button - High Quality */}
          <button
            type="button"
            className="w-full h-14 flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-800 transition-all duration-300 mb-6 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            onClick={() => toast.info('Login com Google em breve')}
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            <span>Continuar com Google</span>
          </button>

          <div className="relative flex items-center gap-4 my-6">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">ou login seguro</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide ml-1">Email</label>
              <input
                type="email"
                required
                className="w-full h-12 px-4 bg-white border-2 border-slate-100 rounded-xl text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-300 font-medium text-slate-800 hover:border-slate-300"
                placeholder="seu@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Senha</label>
                <a href="#" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline">Esqueceu a senha?</a>
              </div>
              <input
                type="password"
                required
                className="w-full h-12 px-4 bg-white border-2 border-slate-100 rounded-xl text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-300 font-medium text-slate-800 hover:border-slate-300"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-base shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 active:transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  Entrar no Sistema <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center bg-white border border-slate-100 py-4 rounded-xl shadow-sm">
            <p className="text-slate-600 text-sm font-medium">
              Ainda não tem acesso?{' '}
              <Link href="/auth/register" className="text-emerald-700 font-bold hover:underline decoration-2 underline-offset-2">
                Criar conta
              </Link>
            </p>
          </div>

          <div className="mt-8 flex justify-center gap-6 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500/50" /> Dados Criptografados</span>
            <span className="flex items-center gap-1.5">🔒 SSL Seguro</span>
          </div>

        </div>
      </div>
    </div>
  );
}

function FeatureRow({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex items-start gap-5 p-4 rounded-2xl transition-all duration-300 hover:bg-white/5 border border-transparent hover:border-white/5">
      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-inner">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-emerald-100/60 leading-snug">{desc}</p>
      </div>
    </div>
  );
}
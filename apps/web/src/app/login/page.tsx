'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import {
  Zap,
  Star,
  ShieldCheck,
  ArrowRight,
  X,
  User,
  Mail,
  Lock,
  Target,
  FileText,
  CheckCircle2,
  Upload,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAppStore();

  const [view, setView] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: 'teste@teste.com',
    password: '123456',
  });

  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  /* ================= LOGIN ================= */
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(loginForm.email, loginForm.password);
      setAuth({ user: res.user, access_token: res.access_token });
      toast.success(`Bem-vindo, ${res.user.fullName || 'Usuário'}!`);
      router.push('/dashboard');
    } catch {
      toast.error('Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  /* ================= REGISTER ================= */
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.register(
        registerForm.email,
        registerForm.password,
        registerForm.fullName
      );
      setAuth({ user: res.user, access_token: res.access_token });
      toast.success('Conta criada com sucesso!');
      router.push('/dashboard');
    } catch {
      toast.error('Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* ================= LEFT SIDE - FEATURES ================= */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-8 xl:p-12">
        {/* Logo & Header */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              JobCopilot
            </span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-3 text-gray-900">
            Encontre a vaga perfeita
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              com inteligência artificial
            </span>
          </h1>

          <p className="text-gray-600 text-base max-w-xl mb-8 leading-relaxed">
            Sistema completo de ATS que analisa seu currículo, faz match inteligente
            com vagas e otimiza suas chances de aprovação
          </p>

          {/* Features Grid - Compact */}
          <div className="grid grid-cols-1 gap-4 max-w-2xl">
            <FeatureCard
              icon={<Target className="w-5 h-5 text-emerald-600" />}
              title="Match Inteligente de Vagas"
              description="IA analisa seu perfil e encontra as vagas com maior compatibilidade"
              highlight="ATS 95%+"
            />

            <FeatureCard
              icon={<FileText className="w-5 h-5 text-emerald-600" />}
              title="Análise Profunda de Currículo"
              description="Sistema ATS escaneia seu CV e compara com requisitos das vagas"
              highlight="3x aprovação"
            />

            <FeatureCard
              icon={<Upload className="w-5 h-5 text-emerald-600" />}
              title="Importação Automática"
              description="Importe vagas de LinkedIn, Indeed e +50 plataformas"
              highlight="Automático"
            />
          </div>
        </div>

        <div className="flex items-center gap-6 mt-6">
          <TrustBadge icon={<CheckCircle2 />} text="10.000+ usuários" />
          <TrustBadge icon={<Star />} text="4.9/5 estrelas" />
        </div>
      </div>

      {/* ================= RIGHT SIDE - AUTH FORM ================= */}
      <div className="w-full lg:w-[480px] xl:w-[520px] bg-white shadow-2xl flex flex-col h-screen">
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {view === 'login' ? 'Bem-vindo de volta' : 'Criar sua conta'}
          </h2>
          <p className="text-gray-600 text-sm">
            {view === 'login'
              ? 'Acesse seu painel e continue sua jornada profissional'
              : 'Comece gratuitamente agora mesmo'}
          </p>
        </div>

        {/* Form Content */}
        <div className="flex-1 px-8 py-6 overflow-y-auto">
          {view === 'login' ? (
            <LoginForm
              loginForm={loginForm}
              setLoginForm={setLoginForm}
              handleLoginSubmit={handleLoginSubmit}
              loading={loading}
              setView={setView}
            />
          ) : (
            <RegisterForm
              registerForm={registerForm}
              setRegisterForm={setRegisterForm}
              handleRegisterSubmit={handleRegisterSubmit}
              loading={loading}
              setView={setView}
            />
          )}
        </div>
      </div>

      {/* Mobile Logo - Only visible on mobile */}
      <div className="lg:hidden absolute top-6 left-6 z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">JobCopilot</span>
        </div>
      </div>
    </div>
  );
}

/* ================= LOGIN FORM ================= */
function LoginForm({
  loginForm,
  setLoginForm,
  handleLoginSubmit,
  loading,
  setView,
}: any) {
  return (
    <>
      <form onSubmit={handleLoginSubmit} className="space-y-4">
        <InputField
          icon={<Mail className="w-5 h-5" />}
          type="email"
          placeholder="seu@email.com"
          label="Email"
          value={loginForm.email}
          onChange={(e) =>
            setLoginForm({ ...loginForm, email: e.target.value })
          }
          required
        />

        <InputField
          icon={<Lock className="w-5 h-5" />}
          type="password"
          placeholder="••••••••"
          label="Senha"
          value={loginForm.password}
          onChange={(e) =>
            setLoginForm({ ...loginForm, password: e.target.value })
          }
          required
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            Lembrar de mim
          </label>
          <button
            type="button"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
            onClick={() => toast.info('Recuperação em breve')}
          >
            Esqueceu a senha?
          </button>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? 'Entrando...' : 'Entrar na plataforma'}
          {!loading && <ArrowRight className="w-5 h-5" />}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-sm text-gray-400 font-medium">OU</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <button
        className="w-full h-11 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700 flex items-center justify-center gap-3"
        onClick={() => toast.info('Login com Google em breve')}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continuar com Google
      </button>

      <p className="text-center text-gray-600 mt-6">
        Ainda não tem uma conta?{' '}
        <button
          className="text-emerald-600 hover:text-emerald-700 font-bold"
          onClick={() => setView('register')}
        >
          Criar conta gratuita
        </button>
      </p>

      {/* Data Protection Notice */}
      <div className="flex items-center justify-center gap-2 mt-6 pt-5 border-t border-gray-100">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <p className="text-xs text-gray-500 text-center">
          Seus dados estão protegidos com criptografia de ponta a ponta
        </p>
      </div>
    </>
  );
}

/* ================= REGISTER FORM ================= */
function RegisterForm({
  registerForm,
  setRegisterForm,
  handleRegisterSubmit,
  loading,
  setView,
}: any) {
  return (
    <>
      <button
        className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold mb-4 transition-colors"
        onClick={() => setView('login')}
      >
        <ArrowRight className="w-4 h-4 rotate-180" />
        Voltar para login
      </button>

      <form onSubmit={handleRegisterSubmit} className="space-y-3">
        <InputField
          icon={<User className="w-5 h-5" />}
          type="text"
          placeholder="João Silva"
          label="Nome completo"
          value={registerForm.fullName}
          onChange={(e) =>
            setRegisterForm({
              ...registerForm,
              fullName: e.target.value,
            })
          }
          required
        />

        <InputField
          icon={<Mail className="w-5 h-5" />}
          type="email"
          placeholder="seu@email.com"
          label="Email"
          value={registerForm.email}
          onChange={(e) =>
            setRegisterForm({
              ...registerForm,
              email: e.target.value,
            })
          }
          required
        />

        <InputField
          icon={<Lock className="w-5 h-5" />}
          type="password"
          placeholder="Mínimo 8 caracteres"
          label="Senha"
          value={registerForm.password}
          onChange={(e) =>
            setRegisterForm({
              ...registerForm,
              password: e.target.value,
            })
          }
          required
        />

        <InputField
          icon={<Lock className="w-5 h-5" />}
          type="password"
          placeholder="Confirme sua senha"
          label="Confirmar senha"
          value={registerForm.confirmPassword}
          onChange={(e) =>
            setRegisterForm({
              ...registerForm,
              confirmPassword: e.target.value,
            })
          }
          required
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-200 mt-4"
        >
          {loading ? 'Criando conta...' : 'Criar conta gratuita'}
        </Button>

        <p className="text-xs text-gray-500 text-center mt-3">
          Ao criar uma conta, você concorda com nossos{' '}
          <a href="/terms" className="text-emerald-600 hover:underline">
            Termos
          </a>{' '}
          e{' '}
          <a href="/privacy" className="text-emerald-600 hover:underline">
            Privacidade
          </a>
        </p>
      </form>
    </>
  );
}

/* ================= COMPONENTS ================= */

function FeatureCard({
  icon,
  title,
  description,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight: string;
}) {
  return (
    <div className="group bg-white rounded-xl p-4 border border-gray-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-gray-900">{title}</h3>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full whitespace-nowrap">
              {highlight}
            </span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

function TrustBadge({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 text-gray-600">
      <div className="text-emerald-600">{icon}</div>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

function InputField({
  icon,
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
        <input
          {...props}
          className="w-full h-11 pl-12 pr-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200"
        />
      </div>
    </div>
  );
}

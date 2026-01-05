'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store'; // <--- Importante para salvar o token
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAppStore(); // <--- Action para salvar sessão
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Cria a conta no Backend
      // Como alteramos o AuthService, ele já retorna { access_token, user }
      const response = await authApi.register(form.email, form.password, form.fullName);
      
      // 2. Faz o Auto-Login (Salva na Store)
      setAuth({
        user: response.user,
        access_token: response.access_token
      });
      
      toast.success('Conta criada com sucesso! Bem-vindo.');
      
      // 3. Redireciona direto para o Dashboard
      router.push('/dashboard');
      
    } catch (error) {
      console.error(error);
      toast.error('Erro ao criar conta. Este email já pode estar em uso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 animate-in fade-in zoom-in-95 duration-300">
      <Card className="w-full max-w-md p-8 bg-white shadow-xl border-none">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Crie sua conta</h1>
            <p className="text-gray-500 mt-2">Comece a organizar suas candidaturas hoje.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="Ex: João Silva"
              value={form.fullName}
              onChange={e => setForm({...form, fullName: e.target.value})}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="seu@email.com"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              disabled={loading}
            />
          </div>
          
          <Button type="submit" disabled={loading} className="w-full py-6 text-base bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all">
            {loading ? 'Criando conta...' : 'Cadastrar Grátis'}
          </Button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Já tem conta? <Link href="/auth/login" className="text-green-600 hover:text-green-800 font-semibold hover:underline">Faça Login</Link>
        </p>
      </Card>
    </div>
  );
}
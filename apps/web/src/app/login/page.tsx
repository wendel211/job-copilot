'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  
  // MUDANÇA PRINCIPAL: Usamos setAuth em vez de setUser/setUserId
  const { setAuth } = useAppStore(); 
  
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {

      const response = await authApi.login(form.email, form.password);
      
      setAuth({
        user: response.user,
        access_token: response.access_token
      });
      
      toast.success('Login realizado com sucesso!');
      
      // 3. Redireciona para o Dashboard
      router.push('/dashboard'); 
      
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Email ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 animate-in fade-in zoom-in-95 duration-300">
      <Card className="w-full max-w-md p-8 bg-white shadow-xl border-none">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Bem-vindo de volta</h1>
            <p className="text-gray-500 mt-2">Acesse seu painel do JobCopilot</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              disabled={loading}
            />
          </div>
          
          <Button type="submit" disabled={loading} className="w-full py-6 text-base shadow-lg hover:shadow-xl transition-all">
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Não tem conta? <Link href="/auth/register" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline">Cadastre-se grátis</Link>
        </p>
      </Card>
    </div>
  );
}
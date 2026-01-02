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
  const { setUser, setUserId } = useAppStore();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await authApi.login(form.email, form.password);
      
      // SALVA O USUÁRIO REAL NO STORE
      setUser(user);
      setUserId(user.id);
      
      toast.success('Login realizado com sucesso!');
      router.push('/dashboard'); // Redireciona
    } catch (error) {
      toast.error('Email ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md p-8 bg-white shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">JobCopilot Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              required
              className="w-full mt-1 p-2 border rounded"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input 
              type="password" 
              required
              className="w-full mt-1 p-2 border rounded"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Não tem conta? <Link href="/register" className="text-blue-600 hover:underline">Cadastre-se</Link>
        </p>
      </Card>
    </div>
  );
}
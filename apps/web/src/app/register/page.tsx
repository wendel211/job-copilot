'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.register(form.email, form.password, form.fullName);
      toast.success('Conta criada! Faça login.');
      router.push('/login');
    } catch (error) {
      toast.error('Erro ao criar conta (Email já existe?)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md p-8 bg-white shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Criar Conta</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
            <input 
              required
              className="w-full mt-1 p-2 border rounded"
              value={form.fullName}
              onChange={e => setForm({...form, fullName: e.target.value})}
            />
          </div>
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
          <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
            {loading ? 'Criando...' : 'Cadastrar'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Já tem conta? <Link href="/login" className="text-blue-600 hover:underline">Faça Login</Link>
        </p>
      </Card>
    </div>
  );
}
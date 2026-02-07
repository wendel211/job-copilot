'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SkillsInput } from '@/components/ui/SkillsInput';
import { LoadingSpinner } from '@/components/ui/Loading';
import {
  FileText,
  Upload,
  Save
} from 'lucide-react';
import { userApi } from '@/lib/api';
import { toast } from 'sonner';

export function UserProfileSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    headline: '',
    bio: '',
    skills: [] as string[],
    resumeUrl: '',
  });

  // Carregar dados ao montar o componente
  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await userApi.getProfile();
        setProfile({
          headline: data.headline || '',
          bio: data.bio || '',
          skills: data.skills || [],
          resumeUrl: data.resumeUrl || '',
        });
      } catch (error) {
        toast.error('Erro ao carregar perfil.');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userApi.updateProfile(profile);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];

    if (file.type !== 'application/pdf') {
      return toast.error('Apenas arquivos PDF são permitidos.');
    }

    const toastId = toast.loading('Enviando currículo...');
    try {
      const result = await userApi.uploadResume(file);

      // Use the extracted profile data returned from the API
      if (result.profile) {
        setProfile(prev => ({
          ...prev,
          resumeUrl: result.profile.resumeUrl || 'uploaded',
          skills: result.profile.skills || prev.skills,
          headline: result.profile.headline || prev.headline,
          bio: result.profile.bio || prev.bio,
        }));
        toast.success('Currículo enviado e dados extraídos!', { id: toastId });
      } else {
        setProfile(prev => ({ ...prev, resumeUrl: 'uploaded' }));
        toast.success('Currículo enviado!', { id: toastId });
      }
    } catch (error) {
      toast.error('Falha no upload.', { id: toastId });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-10"><LoadingSpinner /></div>;
  }

  return (
    <div className="grid gap-6 animate-in slide-in-from-left-4 fade-in duration-300">

      {/* 1. Upload de Currículo */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Currículo</CardTitle></CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative group cursor-pointer">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center gap-3">
              <div className={`p-3 rounded-full transition-colors ${profile.resumeUrl ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                {profile.resumeUrl ? <FileText className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {profile.resumeUrl ? 'Currículo Salvo (Clique para substituir)' : 'Arraste seu PDF ou clique aqui'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {profile.resumeUrl ? 'Nosso sistema já está usando seus dados para melhorar o match.' : 'Usado para gerar cartas de apresentação e auto-complete.'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Formulário de Dados */}
      <form onSubmit={handleSaveProfile}>
        <Card>
          <CardHeader><CardTitle className="text-lg">Dados Profissionais</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Cargo (Headline) <span className="text-xs text-gray-400">({profile.headline.length}/100)</span></label>
              <Input className="text-gray-900 placeholder:text-gray-500" placeholder="Ex: Senior Frontend Dev" maxLength={100} value={profile.headline} onChange={e => setProfile({ ...profile, headline: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Bio <span className="text-xs text-gray-400">({profile.bio.length}/500)</span></label>
              <textarea
                rows={4}
                maxLength={500}
                className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none text-gray-900 placeholder:text-gray-500"
                placeholder="Resumo profissional..."
                value={profile.bio}
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Skills <span className="text-xs text-gray-400">({profile.skills.length}/30)</span></label>
              <p className="text-xs text-gray-500 mb-2">Tecnologias que você domina (Enter para adicionar). Máximo 30.</p>
              <SkillsInput value={profile.skills} onChange={skills => setProfile({ ...profile, skills: skills.slice(0, 30) })} />
            </div>
            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={saving} isLoading={saving}>
                <Save className="w-4 h-4 mr-2" /> Salvar Perfil
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
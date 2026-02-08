'use client';

import React from 'react';
import AppShell from '@/components/layout/AppShell';
import { UserProfileSettings } from '@/components/settings/UserProfileSettings';
import { useAppStore } from '@/lib/store';

export default function SettingsPage() {
  const { userId } = useAppStore();

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Configurações</h1>
          <p className="text-gray-500 mt-2">
            Gerencie seu perfil profissional e preferências.
          </p>
        </div>

        {/* --- CONTEÚDO: PERFIL --- */}
        <UserProfileSettings />

      </div>
    </AppShell>
  );
}
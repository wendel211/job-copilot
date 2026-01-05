/**
 * STORE GLOBAL - ZUSTAND
 * * Gerenciamento de estado centralizado.
 * Atualizado para suportar fluxo de Login/Logout com JWT Token.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Job, SavedJob, EmailDraft } from './api';

// ============================================================================
// TIPOS DO STORE
// ============================================================================

export interface User {
  id: string;
  email: string;
  fullName: string;
}

interface AppState {
  // ====== AUTH STATE (Novo) ======
  userId: string;
  user: User | null;
  token: string | null;      // <--- O Token JWT fica aqui
  isAuthenticated: boolean;
  
  // Actions de Auth
  setAuth: (data: { user: User; access_token: string }) => void; // <--- Chamado no Login
  setUser: (user: User | null) => void; // Chamado ao atualizar perfil
  logout: () => void;
  
  // ====== JOBS ======
  jobs: Job[];
  setJobs: (jobs: Job[]) => void;
  addJob: (job: Job) => void;
  
  // ====== PIPELINE ======
  pipeline: SavedJob[];
  setPipeline: (items: SavedJob[]) => void;
  updatePipelineItem: (id: string, updates: Partial<SavedJob>) => void;
  
  // ====== DRAFTS ======
  drafts: EmailDraft[];
  setDrafts: (drafts: EmailDraft[]) => void;
  
  // ====== UI STATE ======
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  currentView: 'dashboard' | 'jobs' | 'pipeline' | 'drafts' | 'settings';
  setCurrentView: (view: AppState['currentView']) => void;
  
  // ====== LOADING STATES ======
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

// ============================================================================
// CRIAÇÃO DO STORE
// ============================================================================
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // ====== VALORES INICIAIS ======
      userId: '', 
      user: null,
      token: null,
      isAuthenticated: false,

      jobs: [],
      pipeline: [],
      drafts: [],
      sidebarOpen: true,
      currentView: 'dashboard',
      isLoading: false,

      // ====== ACTIONS: AUTH ======
      
      // Chamado no Login com sucesso: Salva Token + User
      setAuth: (data) => set({ 
        user: data.user, 
        userId: data.user.id, 
        token: data.access_token, 
        isAuthenticated: true 
      }),

      // Chamado apenas para atualizar dados do perfil (sem mudar token)
      setUser: (user) => set({ 
        user, 
        userId: user ? user.id : '' 
      }),
      
      logout: () => {
        // Remove a persistência do navegador
        try {
            localStorage.removeItem('jobcopilot-storage');
        } catch (e) {
            console.error('Erro ao limpar storage', e);
        }

        // Reseta o estado
        set({
          user: null,
          userId: '',
          token: null,
          isAuthenticated: false,
          jobs: [],
          pipeline: [],
          drafts: [],
          currentView: 'dashboard',
        });
      },

      // ====== ACTIONS: JOBS ======
      setJobs: (jobs) => set({ jobs }),
      addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),

      // ====== ACTIONS: PIPELINE ======
      setPipeline: (pipeline) => set({ pipeline }),
      updatePipelineItem: (id, updates) =>
        set((state) => ({
          pipeline: state.pipeline.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),

      // ====== ACTIONS: DRAFTS ======
      setDrafts: (drafts) => set({ drafts }),

      // ====== ACTIONS: UI ======
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setCurrentView: (view) => set({ currentView: view }),
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'jobcopilot-storage', // Nome no localStorage
      // AQUI É IMPORTANTE: O que deve sobreviver ao F5?
      partialize: (state) => ({
        userId: state.userId,
        user: state.user,
        token: state.token, // <--- Token precisa persistir
        isAuthenticated: state.isAuthenticated,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

// ============================================================================
// HOOKS CUSTOMIZADOS (SELECTORS)
// ============================================================================

export const useUserId = () => useAppStore((state) => state.userId);
export const useToken = () => useAppStore((state) => state.token); // Novo hook útil

export const usePipelineByStatus = (status: SavedJob['status']) =>
  useAppStore((state) => state.pipeline.filter((item) => item.status === status));

export const useStats = () =>
  useAppStore((state) => ({
    totalJobs: state.jobs.length,
    totalPipeline: state.pipeline.length,
    applied: state.pipeline.filter((i) => i.status === 'sent' || i.status === 'applied').length,
    interviews: state.pipeline.filter((i) => i.status === 'interview').length,
    drafts: state.drafts.length,
  }));
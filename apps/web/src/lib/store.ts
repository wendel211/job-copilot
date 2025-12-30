/**
 * STORE GLOBAL - ZUSTAND
 * 
 * Gerenciamento de estado centralizado e simples.
 * Zustand é mais leve que Redux e perfeito para projetos médios.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Job, SavedJob, EmailDraft } from './api';

// ============================================================================
// TIPOS DO STORE
// ============================================================================
interface AppState {
  // ====== USER ======
  userId: string;
  setUserId: (id: string) => void;
  
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
      userId: 'demo@jobcopilot.local', // Usuário padrão para testes
      jobs: [],
      pipeline: [],
      drafts: [],
      sidebarOpen: true,
      currentView: 'dashboard',
      isLoading: false,

      // ====== ACTIONS: USER ======
      setUserId: (id) => set({ userId: id }),

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
      partialize: (state) => ({
        userId: state.userId,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

// ============================================================================
// HOOKS CUSTOMIZADOS (SELECTORS)
// ============================================================================

/**
 * Hook para pegar apenas o userId
 */
export const useUserId = () => useAppStore((state) => state.userId);

/**
 * Hook para pegar vagas por status no pipeline
 */
export const usePipelineByStatus = (status: SavedJob['status']) =>
  useAppStore((state) => state.pipeline.filter((item) => item.status === status));

/**
 * Hook para estatísticas rápidas
 */
export const useStats = () =>
  useAppStore((state) => ({
    totalJobs: state.jobs.length,
    totalPipeline: state.pipeline.length,
    applied: state.pipeline.filter((i) => i.status === 'sent').length,
    interviews: state.pipeline.filter((i) => i.status === 'interview').length,
    drafts: state.drafts.length,
  }));
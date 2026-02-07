/**
 * SERVIÇO DE API - CLIENTE HTTP
 * Este arquivo centraliza todas as chamadas à API do backend.
 * Usamos axios para fazer requisições HTTP tipadas e organizadas.
 */

import axios from 'axios';
import { useAppStore } from './store'; // <--- IMPORTANTE: Importar a store para pegar o token

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3003';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

// ============================================================================
// INTERCEPTOR DE AUTENTICAÇÃO (Obrigatorio para JWT)
// ============================================================================
apiClient.interceptors.request.use((config) => {
  // 1. Pega o token atual do estado global (Zustand)
  const token = useAppStore.getState().token;

  // 2. Se houver token, injeta no cabeçalho Authorization
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Logging em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    // console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se der erro 401 (Não autorizado), podemos deslogar o usuário automaticamente
    if (error.response?.status === 401) {
      useAppStore.getState().logout();
    }

    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API Error: ${error.config?.url}`, error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// TIPOS (TypeScript)
// ============================================================================
export interface Company {
  id: string;
  name: string;
  website: string | null;
}

export interface Job {
  id: string;
  title: string;
  location: string | null;
  remote: boolean;
  description: string;
  applyUrl: string;
  atsType: string;
  sourceType: 'manual' | 'linkedin' | 'adzuna' | 'programathor' | 'remotive' | 'gupy' | 'greenhouse' | 'lever';
  company: Company;
  createdAt: string;
  descriptionEditedAt?: string | null;
  descriptionSource?: 'auto' | 'manual';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  headline?: string;
  bio?: string;
  skills: string[];
  linkedinUrl?: string;
  resumeUrl?: string;
}

export type PipelineStage =
  | 'discovered'
  | 'prepared'
  | 'applied'
  | 'sent'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'closed';

export interface SavedJob {
  id: string;
  status: PipelineStage;
  notes: string | null;
  appliedAt: string | null;
  job: Job;
  createdAt: string;
  updatedAt: string;
}

export interface EmailDraft {
  id: string;
  subject: string;
  bodyText: string;
  toEmail: string | null;
  job: Job | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailProvider {
  id: string;
  type: 'smtp' | 'gmail_oauth' | 'microsoft_oauth';
  isActive: boolean;
  fromEmail: string | null;
  fromName: string | null;
}

// ============================================================================
// 1. API - AUTH (LOGIN & REGISTRO)
// ============================================================================
export const authApi = {
  async login(email: string, password: string) {
    const { data } = await apiClient.post('/auth/login', { email, password });
    return data;
  },

  async register(email: string, password: string, fullName: string) {
    const { data } = await apiClient.post('/auth/register', { email, password, fullName });
    return data;
  }
};

// ============================================================================
// 2. API - USER PROFILE
// ============================================================================
export const userApi = {
  /**
   * Buscar perfil do usuário logado
   */
  getProfile: async () => {
    const { data } = await apiClient.get<UserProfile>('/users/profile');
    return data;
  },

  /**
   * Atualizar dados do perfil (Skills, Bio, etc)
   */
  updateProfile: async (data: Partial<UserProfile>) => {
    const response = await apiClient.patch('/users/profile', data);
    return response.data;
  },

  /**
   * Upload de Currículo (PDF)
   */
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    // O browser seta automaticamente o boundary do multipart/form-data
    const response = await apiClient.post('/users/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

// ============================================================================
// API - JOBS (Busca de Vagas)
// ============================================================================
export const jobsApi = {
  async search(params?: {
    page?: number;
    q?: string;
    company?: string;
    remote?: boolean;
    atsType?: string;
    source?: string;
    take?: number;
  }): Promise<PaginatedResponse<Job>> {
    const response = await apiClient.get('/jobs', {
      params: {
        page: params?.page,
        q: params?.q, // Mapeado corretamente para o backend
        company: params?.company,
        remote: params?.remote,
        atsType: params?.atsType,
        source: params?.source,
        limit: params?.take
      }
    });
    return response.data;
  },

  async getById(id: string): Promise<Job> {
    const response = await apiClient.get(`/jobs/${id}`);
    return response.data;
  },

  async getRecommendations(): Promise<Job[]> {
    const response = await apiClient.get('/jobs/recommendations');
    return response.data;
  },

  // Atualizar descrição manualmente (limite de 24h)
  async updateDescription(jobId: string, description: string): Promise<Job> {
    const response = await apiClient.patch(`/jobs/${jobId}/description`, { description });
    return response.data;
  }
};

// ============================================================================
// API - AI (Inteligência Artificial / Match)
// ============================================================================
export const aiApi = {
  async analyzeMatch(userId: string, jobId: string) {
    const { data } = await apiClient.post('/ai/match', { userId, jobId });
    return data;
  }
};

// ============================================================================
// API - IMPORT (Importação Manual)
// ============================================================================
export const importApi = {
  async importFromLink(url: string, userId: string): Promise<{ success: boolean; job: Job }> {
    const response = await apiClient.post('/import/link', { url, userId });
    return response.data;
  },
};

// ============================================================================
// API - PIPELINE (Kanban de Candidaturas)
// ============================================================================
export const pipelineApi = {
  async list(userId: string): Promise<SavedJob[]> {
    const response = await apiClient.get(`/pipeline/user/${userId}`);
    return response.data;
  },

  async getAll(userId: string): Promise<SavedJob[]> {
    return this.list(userId);
  },

  async create(userId: string, jobId: string): Promise<SavedJob> {
    const response = await apiClient.post('/pipeline', { userId, jobId });
    return response.data;
  },

  async updateStatus(itemId: string, status: string): Promise<SavedJob> {
    const response = await apiClient.patch(`/pipeline/${itemId}/status`, { status });
    return response.data;
  },

  async addNote(itemId: string, note: string): Promise<SavedJob> {
    const response = await apiClient.patch(`/pipeline/${itemId}/note`, { note });
    return response.data;
  },

  async delete(itemId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/pipeline/${itemId}`);
    return response.data;
  },
};

// ============================================================================
// API - EMAIL DRAFTS (Rascunhos)
// ============================================================================
export const draftsApi = {
  async list(userId: string): Promise<{ drafts: EmailDraft[] }> {
    const response = await apiClient.get('/email/drafts', { params: { userId } });
    return response.data;
  },

  async get(draftId: string, userId: string): Promise<{ draft: EmailDraft }> {
    const response = await apiClient.get(`/email/drafts/${draftId}`, { params: { userId } });
    return response.data;
  },

  async update(draftId: string, userId: string, data: {
    subject?: string;
    bodyText?: string;
    toEmail?: string;
  }): Promise<{ draft: EmailDraft }> {
    const response = await apiClient.patch(`/email/drafts/${draftId}`, { userId, ...data });
    return response.data;
  },

  async delete(draftId: string, userId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/email/drafts/${draftId}`, { params: { userId } });
    return response.data;
  },
};

// ============================================================================
// API - EMAIL SEND (Envio)
// ============================================================================
export const emailApi = {
  async send(userId: string, data: { subject: string; body: string; to: string; jobId?: string }): Promise<{ success: boolean; messageId: string }> {
    const response = await apiClient.post('/email/send', { userId, ...data });
    return response.data;
  },

  async sendDraft(userId: string, draftId: string): Promise<{ success: boolean; messageId: string }> {
    const response = await apiClient.post('/email/send/draft', { userId, draftId });
    return response.data;
  }
};

export const statsApi = {
  async getSummary(userId: string) {
    const { data } = await apiClient.get('/stats', { params: { userId } });
    return data;
  },
};

// ============================================================================
// API - EMAIL PROVIDERS (Configuração SMTP)
// ============================================================================
export const providersApi = {
  async list(userId: string): Promise<{ providers: EmailProvider[] }> {
    const response = await apiClient.get('/email/providers', { params: { userId } });
    return response.data;
  },

  async create(data: {
    userId: string;
    type: string;
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    smtpUser: string;
    smtpPass: string;
    fromEmail: string;
    fromName: string;
  }): Promise<{ provider: EmailProvider }> {
    const response = await apiClient.post('/email/providers', data);
    return response.data;
  },

  async test(providerId: string): Promise<{ ok: boolean }> {
    const response = await apiClient.post(`/email/providers/${providerId}/test`);
    return response.data;
  },

  async delete(providerId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/email/providers/${providerId}`);
    return response.data;
  },
};

export default {
  auth: authApi,
  user: userApi,
  jobs: jobsApi,
  ai: aiApi,
  import: importApi,
  pipeline: pipelineApi,
  drafts: draftsApi,
  email: emailApi,
  providers: providersApi,
  stats: statsApi,
};
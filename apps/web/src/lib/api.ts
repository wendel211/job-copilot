/**
 * SERVIÇO DE API - CLIENTE HTTP
 * * Este arquivo centraliza todas as chamadas à API do backend.
 * Usamos axios para fazer requisições HTTP tipadas e organizadas.
 */

import axios from 'axios';

// ============================================================================
// CONFIGURAÇÃO BASE
// ============================================================================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3003';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

// Interceptor para logging (desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  apiClient.interceptors.request.use((config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  });

  apiClient.interceptors.response.use(
    (response) => {
      console.log(`✅ API Response: ${response.config.url}`, response.data);
      return response;
    },
    (error) => {
      console.error(`❌ API Error: ${error.config?.url}`, error.response?.data || error.message);
      return Promise.reject(error);
    }
  );
}

// ============================================================================
// TIPOS (TypeScript)
// ============================================================================
export interface Job {
  id: string;
  title: string;
  location: string | null;
  remote: boolean;
  description: string;
  applyUrl: string;
  atsType: string;
  company: {
    id: string;
    name: string;
    website: string | null;
  };
  createdAt: string;
}

export type PipelineStage = 
  | 'discovered' 
  | 'prepared' 
  | 'applied'    // Novo
  | 'sent' 
  | 'screening' 
  | 'interview' 
  | 'offer'      // Novo
  | 'rejected'   // Novo
  | 'closed';

export interface SavedJob {
  id: string;
  status: PipelineStage;
  notes: string | null;
  appliedAt: string | null; // Novo campo
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
// API - JOBS (Busca de Vagas)
// ============================================================================
export const jobsApi = {
  /**
   * Buscar vagas com filtros
   */
  async search(params?: {
    q?: string;
    company?: string;
    remote?: boolean;
    atsType?: string;
    take?: number;
    skip?: number;
  }): Promise<Job[]> {
    const response = await apiClient.get('/jobs/search', { params });
    return response.data;
  },

  /**
   * Buscar detalhes de uma vaga específica
   */
  async getById(id: string): Promise<Job> {
    const response = await apiClient.get(`/jobs/${id}`);
    return response.data;
  },
};

// ============================================================================
// API - IMPORT (Importação Manual)
// ============================================================================
export const importApi = {
  /**
   * Importar vaga por URL
   */
  async importFromLink(url: string, userId: string): Promise<{ success: boolean; job: Job }> {
    const response = await apiClient.post('/import/link', { url, userId });
    return response.data;
  },
};

// ============================================================================
// API - PIPELINE (Kanban de Candidaturas)
// ============================================================================
export const pipelineApi = {
  /**
   * Listar vagas salvas do usuário (Alias para getAll)
   */
  async list(userId: string): Promise<SavedJob[]> {
    const response = await apiClient.get(`/pipeline/user/${userId}`);
    return response.data;
  },

  /**
   * Alias para list (usado na ApplicationsPage)
   */
  async getAll(userId: string): Promise<SavedJob[]> {
    return this.list(userId);
  },

  /**
   * Adicionar vaga ao pipeline (Salvar)
   */
  async create(userId: string, jobId: string): Promise<SavedJob> {
    const response = await apiClient.post('/pipeline', { userId, jobId });
    return response.data;
  },

  /**
   * Atualizar status da vaga
   */
  async updateStatus(itemId: string, status: string): Promise<SavedJob> {
    const response = await apiClient.patch(`/pipeline/${itemId}/status`, { status });
    return response.data;
  },

  /**
   * Adicionar nota
   */
  async addNote(itemId: string, note: string): Promise<SavedJob> {
    const response = await apiClient.patch(`/pipeline/${itemId}/note`, { note });
    return response.data;
  },
};

// ============================================================================
// API - EMAIL DRAFTS (Rascunhos)
// ============================================================================
export const draftsApi = {
  /**
   * Listar rascunhos do usuário
   */
  async list(userId: string): Promise<{ drafts: EmailDraft[] }> {
    const response = await apiClient.get('/email/drafts', { params: { userId } });
    return response.data;
  },

  /**
   * Obter rascunho específico
   */
  async get(draftId: string, userId: string): Promise<{ draft: EmailDraft }> {
    const response = await apiClient.get(`/email/drafts/${draftId}`, { params: { userId } });
    return response.data;
  },

  /**
   * Atualizar rascunho
   */
  async update(draftId: string, userId: string, data: {
    subject?: string;
    bodyText?: string;
    toEmail?: string;
  }): Promise<{ draft: EmailDraft }> {
    const response = await apiClient.patch(`/email/drafts/${draftId}`, { userId, ...data });
    return response.data;
  },
};

// ============================================================================
// API - EMAIL SEND (Envio)
// ============================================================================
export const emailApi = {
  /**
   * Enviar email
   */
  async send(userId: string, draftId: string): Promise<{ send: any }> {
    const response = await apiClient.post('/email/send', { userId, draftId });
    return response.data;
  },
};

// ============================================================================
// API - EMAIL PROVIDERS (Configuração SMTP)
// ============================================================================
export const providersApi = {
  /**
   * Listar provedores configurados
   */
  async list(userId: string): Promise<{ providers: EmailProvider[] }> {
    const response = await apiClient.get('/email/providers', { params: { userId } });
    return response.data;
  },

  /**
   * Criar novo provedor SMTP
   */
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

  /**
   * Testar conexão SMTP
   */
  async test(providerId: string): Promise<{ ok: boolean }> {
    const response = await apiClient.post(`/email/providers/${providerId}/test`);
    return response.data;
  },
};

// ============================================================================
// EXPORTAÇÃO DEFAULT
// ============================================================================
export default apiClient; // Exporta a instância axios por padrão, caso precise acessar diretamente
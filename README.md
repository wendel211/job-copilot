#  jOB Copilot

> **Seu assistente inteligente de candidaturas a vagas de emprego.**  
> Encontre vagas, gerencie seu pipeline, redija e-mails com IA — tudo em um só lugar.

---

##  Visão Geral

O **jOB Copilot** é uma plataforma SaaS completa que centraliza e automatiza o processo de busca de emprego. O sistema importa vagas de múltiplas fontes (LinkedIn, Gupy, Greenhouse, Adzuna etc.), organiza o processo seletivo em um pipeline visual por estágio (Kanban), e usa Inteligência Artificial para:

- **Analisar** a descrição da vaga e extrair requisitos-chave
- **Gerendar rascunhos de e-mail** personalizados de apresentação
- **Pontuar o match** entre o perfil do candidato e a vaga

---

##  Arquitetura do Projeto

O projeto é um **monorepo** gerenciado com [Turborepo](https://turbo.build/) e [pnpm workspaces](https://pnpm.io/workspaces).

```
job-copilot/
├── apps/
│   ├── api/          # Backend — NestJS + Prisma + PostgreSQL
│   └── web/          # Frontend — Next.js 16 + TailwindCSS
├── packages/         # Pacotes compartilhados (tipos, utilitários)
├── turbo.json        # Configuração do Turborepo
└── package.json      # Scripts globais do monorepo
```

---

##  Stack Tecnológica

### Backend (`apps/api`)
| Tecnologia | Função |
|---|---|
| **NestJS 11** | Framework principal da API REST |
| **Prisma 7** | ORM e migrations com PostgreSQL |
| **PostgreSQL** | Banco de dados relacional |
| **Passport + JWT** | Autenticação e autorização |
| **Swagger** | Documentação automática da API |
| **Nodemailer** | Envio de e-mails via SMTP / OAuth |
| **Cheerio** | Web scraping das páginas de vagas |
| **Axios** | Chamadas a APIs externas (Adzuna, Gupy etc.) |
| **pdf-parse** | Extração de texto do currículo em PDF |
| **bcryptjs** | Hash de senhas |
| **Zod** | Validação de schemas |

### Frontend (`apps/web`)
| Tecnologia | Função |
|---|---|
| **Next.js 16** | Framework React com App Router |
| **React 19** | Biblioteca de UI |
| **TailwindCSS 4** | Estilização utilitária |
| **Zustand** | Gerenciamento de estado global |
| **React Hook Form + Zod** | Formulários com validação |
| **dnd-kit** | Drag & Drop para o Kanban de pipeline |
| **Lucide React** | Ícones |
| **Sonner** | Notificações toast |
| **date-fns** | Formatação de datas |
| **Axios** | Chamadas à API |

---

## 📐 Módulos da API

| Módulo | Descrição |
|---|---|
| `auth` | Registro, login e validação JWT |
| `users` | Gerenciamento de perfil do usuário |
| `jobs` | CRUD de vagas e integração com fontes externas |
| `import` | Importação de vagas via URL / ATS / plataformas |
| `pipeline` | Gestão do pipeline de candidaturas (Kanban) |
| `email` | Rascunhos, provedores e envio de e-mails |
| `templates` | Templates de e-mail personalizados por usuário |
| `ai` | Análise de vagas e geração de conteúdo com IA |
| `credits` | Sistema de créditos para importações pagas |
| `stats` | Estatísticas do dashboard |
| `events` | Log de auditoria de todas as ações |
| `health` | Endpoint de health-check da API |

---

##  Modelo de Dados (Banco)

O banco de dados é gerenciado pelo **Prisma** e possui os seguintes modelos principais:

```
User            → Conta do candidato
 ├── SavedJob   → Vaga salva no pipeline
 ├── EmailDraft → Rascunho de e-mail vinculado a uma vaga
 ├── EmailSend  → Histórico de e-mails enviados
 ├── EmailProvider → Configuração SMTP / Gmail / Microsoft
 ├── UserTemplate  → Template base de apresentação
 └── CreditPurchase → Compra de créditos via PIX (AbacatePay)

Job             → Vaga de emprego (crawleada ou manual)
 ├── Company    → Empresa anunciante
 └── JobRequirement → Requisitos extraídos por IA (skills, senioridade)

Event           → Tabela de auditoria de todas as ações do sistema
```

### Status do Pipeline (`SavedJob`)

| Status | Significado |
|---|---|
| `discovered` | Vaga salva (padrão) |
| `prepared` | Pronto para candidatar |
| `applied` | Candidatura enviada |
| `sent` | E-mail enviado pelo sistema |
| `screening` | Em triagem com o RH |
| `interview` | Em processo de entrevista |
| `offer` | Proposta recebida |
| `rejected` | Rejeitado |
| `closed` | Vaga encerrada |

### Fontes de Vagas (`JobSourceType`)

`manual` · `linkedin` · `gupy` · `greenhouse` · `lever` · `workday` · `adzuna` · `programathor` · `remotive`

---

##  Como Executar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 9
- [PostgreSQL](https://www.postgresql.org/) rodando localmente ou via Docker

### 1. Clone e instale as dependências

```bash
git clone <url-do-repositorio>
cd job-copilot
pnpm install
```

### 2. Configure as variáveis de ambiente

Crie o arquivo `apps/.env` baseado no exemplo abaixo:

```env
# Banco de dados (OBRIGATÓRIO)
DATABASE_URL="postgresql://usuario:senha@localhost:5432/jobcopilot?schema=public"

# Segurança
JWT_SECRET=sua_chave_jwt_super_secreta_aqui
ENCRYPTION_KEY=sua_chave_de_32_caracteres_aqui

# Configuração da API
NODE_ENV=development
PORT=3003

# Adzuna (opcional — para importar vagas)
ADZUNA_APP_ID=seu_app_id
ADZUNA_APP_KEY=sua_app_key
```

### 3. Execute as migrations do banco

```bash
cd apps/api
npx prisma migrate dev
npx prisma db seed   # opcional: dados iniciais
```

### 4. Inicie em modo desenvolvimento

Na raiz do projeto (roda API + Web simultaneamente via Turborepo):

```bash
pnpm dev
```

Ou individualmente:

```bash
# API — http://localhost:3003
cd apps/api && pnpm dev

# Web — http://localhost:3002
cd apps/web && pnpm dev
```

---

##  URLs Disponíveis

| Serviço | URL |
|---|---|
| **Frontend** | http://localhost:3002 |
| **API REST** | http://localhost:3003 |
| **Swagger (docs)** | http://localhost:3003/docs |

---

##  Estrutura de Páginas (Frontend)

| Rota | Descrição |
|---|---|
| `/` | Redireciona para o dashboard |
| `/login` | Tela de autenticação |
| `/dashboard` | Visão geral com estatísticas |
| `/jobs` | Explorar e importar vagas |
| `/pipeline` | Pipeline Kanban de candidaturas |
| `/applications` | Lista detalhada de candidaturas |
| `/drafts` | Rascunhos de e-mails |
| `/settings` | Configurações da conta |
| `/pricing` | Planos e créditos |
| `/privacy` | Política de privacidade |
| `/terms` | Termos de uso |

---

##  Scripts Disponíveis

Execute na **raiz do monorepo**:

| Comando | Ação |
|---|---|
| `pnpm dev` | Inicia todos os apps em modo desenvolvimento |
| `pnpm build` | Gera o build de produção de todos os apps |
| `pnpm lint` | Executa o linter em todos os apps |
| `pnpm typecheck` | Verifica os tipos TypeScript em todos os apps |

Execute na pasta `apps/api`:

| Comando | Ação |
|---|---|
| `pnpm test` | Executa os testes unitários |
| `pnpm test:e2e` | Executa os testes end-to-end |
| `pnpm test:cov` | Gera relatório de cobertura de testes |

---

## Sistema de Créditos

O jOB Copilot possui um sistema de **créditos de importação**. Cada importação de vaga via URL ou plataforma externa consome créditos. O usuário pode adquirir créditos via **PIX** integrado com o [AbacatePay](https://abacatepay.com/).

---

##  Licença

Este projeto é de uso **privado**. Todos os direitos reservados.

---

<p align="center">

<img src="https://github.com/user-attachments/assets/0bff724a-dc47-4caa-a224-858aa151e1e6" alt="job4" width="400" />
<img src="https://github.com/user-attachments/assets/9bc880ee-8259-4ea4-9784-65727b65c880" alt="job1" width="400" />
<img src="https://github.com/user-attachments/assets/d4f9cfb1-c8d8-4abf-b171-711910db5778" alt="job2" width="400" />
<img src="https://github.com/user-attachments/assets/bcb88dd5-9968-4a23-8230-9d4c37fa3965" alt="job3" width="400" />



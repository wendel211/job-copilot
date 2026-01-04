import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../../prisma/prisma.service';
import { JobSourceType, AtsType } from '@prisma/client';

@Injectable()
export class AdzunaService {
  private readonly logger = new Logger(AdzunaService.name);
  private readonly BASE_URL = 'https://api.adzuna.com/v1/api/jobs/br/search/1';

  constructor(private prisma: PrismaService) {}

  async importJobs() {
    if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) {
      this.logger.warn('⚠️ Adzuna credentials not found in .env');
      return;
    }

    try {
      this.logger.log('🔄 Buscando vagas no Adzuna...');
      
      const response = await axios.get(this.BASE_URL, {
        params: {
          app_id: process.env.ADZUNA_APP_ID,
          app_key: process.env.ADZUNA_APP_KEY,
          results_per_page: 50, // Máximo por página
          what: 'desenvolvedor software programador fullstack backend frontend', 
          where: 'brasil',
          content_type: 'application/json',
          max_days_old: 3, // Apenas vagas frescas
        },
      });

      const jobs = response.data.results;
      let newJobsCount = 0;

      for (const job of jobs) {
        // 1. Normalização de Empresa
        const companyName = job.company?.display_name || 'Confidencial';
        const company = await this.prisma.company.upsert({
          where: { name: companyName },
          update: {},
          create: { name: companyName },
        });

        // 2. Deduplicação e Upsert da Vaga
        // Usamos o ID do Adzuna como chave única para não duplicar
        await this.prisma.job.upsert({
          where: {
            sourceType_sourceKey: {
              sourceType: JobSourceType.adzuna,
              sourceKey: String(job.id),
            },
          },
          update: {}, // Se já existe, não faz nada (ou poderia atualizar status)
          create: {
            title: job.title,
            description: job.description, // Adzuna manda um resumo
            location: job.location?.display_name || 'Brasil',
            applyUrl: job.redirect_url,
            sourceType: JobSourceType.adzuna,
            sourceKey: String(job.id),
            atsType: AtsType.unknown, // Adzuna redireciona, difícil saber o ATS direto
            companyId: company.id,
            postedAt: new Date(job.created),
            remote: job.description.toLowerCase().includes('remoto') || job.title.toLowerCase().includes('remote'),
          },
        });
        newJobsCount++;
      }

      this.logger.log(`✅ Adzuna: ${newJobsCount} vagas processadas.`);
    } catch (error) {
      this.logger.error('❌ Erro no Adzuna Service:', error.message);
    }
  }
}
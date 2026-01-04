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
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
      this.logger.warn('⚠️ Credenciais do Adzuna não encontradas no .env');
      return;
    }

    try {
      this.logger.log('🔄 Buscando vagas no Adzuna...');
      
      const response = await axios.get(this.BASE_URL, {
        // CORREÇÃO: Enviamos o tipo esperado no HEADER, não na URL
        headers: {
            'Accept': 'application/json'
        },
        params: {
          app_id: appId,
          app_key: appKey,
          results_per_page: 50,
          // Simplifiquei a query para garantir resultados. 
          // O Adzuna busca por "qualquer uma" dessas palavras.
          what: 'desenvolvedor programador software', 
          where: 'brasil',
          max_days_old: 15, // Aumentei para garantir que venham vagas no teste
        },
      });

      const jobs = response.data.results;
      
      // Se a API responder, mas a lista vier vazia
      if (!jobs || jobs.length === 0) {
        this.logger.warn('⚠️ Adzuna respondeu OK, mas não encontrou vagas com esses filtros.');
        return;
      }

      let newJobsCount = 0;

      for (const job of jobs) {
        const companyName = job.company?.display_name || 'Confidencial';
        
        const company = await this.prisma.company.upsert({
          where: { name: companyName },
          update: {},
          create: { name: companyName },
        });

        // O Adzuna às vezes manda IDs repetidos em páginas diferentes, usamos String() para garantir
        const sourceKey = String(job.id);

        await this.prisma.job.upsert({
          where: {
            sourceType_sourceKey: {
              sourceType: JobSourceType.adzuna,
              sourceKey: sourceKey,
            },
          },
          update: {},
          create: {
            title: job.title,
            // Adzuna manda um resumo curto. Removemos tags HTML simples se vierem.
            description: job.description.replace(/<[^>]*>?/gm, '') || 'Ver detalhes no link original',
            location: job.location?.display_name || 'Brasil',
            applyUrl: job.redirect_url,
            sourceType: JobSourceType.adzuna,
            sourceKey: sourceKey,
            atsType: AtsType.unknown,
            companyId: company.id,
            postedAt: new Date(job.created),
            remote: job.description.toLowerCase().includes('remoto') || 
                    job.title.toLowerCase().includes('remote') || false,
          },
        });
        newJobsCount++;
      }

      this.logger.log(`✅ Adzuna: ${newJobsCount} vagas processadas.`);
    } catch (error) {
      if (error.response) {
        this.logger.error(`❌ Erro API Adzuna (Status ${error.response.status}):`);
        // Se ainda der erro, isso vai nos dizer se é JSON ou HTML
        console.error('🔍 DADOS DO ERRO:', JSON.stringify(error.response.data, null, 2).substring(0, 500)); 
      } else {
        this.logger.error('❌ Erro de conexão com Adzuna:', error.message);
      }
    }
  }
}
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../../prisma/prisma.service';
import { JobSourceType, AtsType } from '@prisma/client';

@Injectable()
export class RemotiveService {
  private readonly logger = new Logger(RemotiveService.name);
  private readonly BASE_URL = 'https://remotive.com/api/remote-jobs';

  constructor(private prisma: PrismaService) {}

  async importJobs() {
    try {
      this.logger.log('🔄 A buscar vagas no Remotive...');

      // Busca vagas da categoria Software Development
      const response = await axios.get(this.BASE_URL, {
        params: {
          category: 'software-dev',
          limit: 100, // Limite para não sobrecarregar numa única execução
        },
      });

      const jobs = response.data.jobs;
      let count = 0;

      for (const job of jobs) {
        // 1. Filtro de Localização (Crítico para não trazer vagas "US Only")
        if (!this.isFriendlyLocation(job.candidate_required_location)) {
          continue;
        }

        // 2. Garante a Empresa
        const companyName = job.company_name || 'Confidencial';
        const company = await this.prisma.company.upsert({
          where: { name: companyName },
          update: {},
          create: { name: companyName },
        });

        // 3. Salva a Vaga
        // O Remotive usa IDs numéricos, convertemos para string
        const sourceKey = String(job.id);

        await this.prisma.job.upsert({
          where: {
            sourceType_sourceKey: {
              sourceType: JobSourceType.remotive,
              sourceKey: sourceKey,
            },
          },
          update: {},
          create: {
            title: job.title,
            // Remotive envia HTML no description, mas guardamos assim mesmo
            // O frontend pode sanitizar ou podemos usar uma lib para limpar aqui
            description: job.description || 'Descrição indisponível',
            location: job.candidate_required_location || 'Remoto Global',
            remote: true, // Remotive é 100% remoto
            applyUrl: job.url,
            sourceType: JobSourceType.remotive,
            sourceKey: sourceKey,
            atsType: AtsType.unknown,
            companyId: company.id,
            postedAt: new Date(job.publication_date),
          },
        });

        count++;
      }

      this.logger.log(`✅ Remotive: ${count} vagas processadas (filtradas por localização).`);
    } catch (error) {
      this.logger.error('❌ Erro no Remotive Service:', error.message);
    }
  }

  /**
   * Verifica se a vaga aceita candidatos do Brasil
   */
  private isFriendlyLocation(location: string): boolean {
    if (!location) return true; // Se não especifica, assumimos que pode ser global
    
    const loc = location.toLowerCase();
    const friendlyTerms = [
      'brazil', 'brasil', 
      'latin america', 'latam', 'south america',
      'worldwide', 'global', 'anywhere', 
      'remote', 'americas'
    ];

    // Se contiver qualquer um dos termos amigáveis
    const isFriendly = friendlyTerms.some(term => loc.includes(term));
    
    // Mas rejeitamos se for explicitamente restritivo a outros locais comuns
    const isRestricted = (loc.includes('usa only') || loc.includes('us only') || loc.includes('eu only'));

    return isFriendly && !isRestricted;
  }
}
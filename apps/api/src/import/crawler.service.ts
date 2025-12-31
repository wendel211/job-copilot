import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GreenhouseScraper } from './scrapers/greenhouse.scraper';
import { LeverScraper } from './scrapers/lever.scraper';
import { GupyScraper } from './scrapers/gupy.scraper';
import { JobSourceType } from '@prisma/client';
// IMPORTANTE: Importar a interface para corrigir o erro de tipagem
import { ScrapedJob } from './scrapers/scraper.interface';

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly greenhouse: GreenhouseScraper,
    private readonly lever: LeverScraper,
    private readonly gupy: GupyScraper,
  ) {}

  /**
   * Método principal: Crawl de todas as empresas cadastradas
   */
  async crawlAllCompanies() {
    // 1. Buscar empresas configuradas para crawl
    // Se o 'atsProvider' ainda der erro aqui, certifique-se de rodar 'npx prisma generate'
    const companies = await this.prisma.company.findMany({
      where: {
        atsProvider: { not: null },
        careerPageUrl: { not: null },
      },
    });

    this.logger.log(`🤖 Iniciando crawler para ${companies.length} empresas...`);

    const results = {
      processed: 0,
      newJobs: 0,
      errors: 0,
    };

    for (const company of companies) {
      const result = await this.crawlCompany(company);
      results.processed++;
      results.newJobs += result.saved;
      if (result.error) results.errors++;
    }

    this.logger.log(`✅ Crawler finalizado. Total processado: ${results.processed}, Novas vagas: ${results.newJobs}`);
    return results;
  }

  /**
   * Processa uma única empresa
   */
  private async crawlCompany(company: any) {
    this.logger.log(`Crawling: ${company.name} [${company.atsProvider}]`);
    
    // FIX: Tipagem explícita para evitar o erro 'never'
    let jobsFound: ScrapedJob[] = [];

    // 2. Chamar o scraper correto
    try {
      if (company.atsProvider === 'greenhouse') {
        jobsFound = await this.greenhouse.listJobs(company.careerPageUrl);
      } else if (company.atsProvider === 'lever') {
        jobsFound = await this.lever.listJobs(company.careerPageUrl);
      } else if (company.atsProvider === 'gupy') {
        jobsFound = await this.gupy.listJobs(company.careerPageUrl);
      } else {
        this.logger.warn(`ATS não suportado para crawler: ${company.atsProvider}`);
        return { saved: 0, error: false };
      }
    } catch (error: any) {
      this.logger.error(`Falha ao baixar vagas de ${company.name}: ${error.message}`);
      return { saved: 0, error: true };
    }

    if (!jobsFound || jobsFound.length === 0) {
      this.logger.log(`  - Nenhuma vaga encontrada.`);
      return { saved: 0, error: false };
    }

    // 3. Salvar/Atualizar vagas no banco
    let savedCount = 0;
    
    for (const jobData of jobsFound) {
      const sourceKey = `url:${jobData.applyUrl}`;

      // Verifica se já existe
      const existingJob = await this.prisma.job.findUnique({
        where: { 
          sourceType_sourceKey: { 
            sourceType: JobSourceType.manual, 
            sourceKey 
          } 
        }
      });

      if (!existingJob) {
        await this.prisma.job.create({
          data: {
            sourceType: JobSourceType.manual,
            sourceKey,
            title: jobData.title,
            description: jobData.description || '',
            applyUrl: jobData.applyUrl,
            location: jobData.location,
            remote: jobData.remote || false,
            // O cast 'as any' ajuda se o TS reclamar do enum vindo do banco vs enum do código
            atsType: company.atsProvider as any, 
            companyId: company.id,
            postedAt: jobData.postedAt,
          },
        });
        savedCount++;
      }
    }

    // 4. Atualizar timestamp da empresa
    await this.prisma.company.update({
      where: { id: company.id },
      data: { lastCrawledAt: new Date() },
    });

    this.logger.log(`  - ${jobsFound.length} vagas lidas, ${savedCount} novas salvas.`);
    return { saved: savedCount, error: false };
  }
}   
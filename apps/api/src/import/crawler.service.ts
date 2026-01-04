import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { AdzunaService } from './sources/adzuna.service';
import { ProgramathorService } from './sources/programathor.service';
import { RemotiveService } from './sources/remotive.service';

import { GreenhouseScraper } from './scrapers/greenhouse.scraper';
import { LeverScraper } from './scrapers/lever.scraper';
import { WorkdayScraper } from './scrapers/workday.scraper';
import { GupyScraper } from './scrapers/gupy.scraper';
import { PrismaService } from '../../prisma/prisma.service';
import { AtsType, JobSourceType } from '@prisma/client';

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);
  
  // TRAVA DE SEGURANÇA
  private isRunning = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly greenhouse: GreenhouseScraper,
    private readonly lever: LeverScraper,
    private readonly workday: WorkdayScraper,
    private readonly gupy: GupyScraper,
    private readonly adzuna: AdzunaService,
    private readonly programathor: ProgramathorService,
    private readonly remotive: RemotiveService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleDailyIngestion() {
    // 1. Verifica se já está rodando
    if (this.isRunning) {
      this.logger.warn('⚠️ Crawler já está em execução. Ignorando chamada duplicada.');
      return;
    }

    this.isRunning = true; // TRAVA
    this.logger.log('🚀 [CRAWLER] Iniciando ingestão diária de vagas...');
    
    try {
      // 2. Executa as fontes sequencialmente para evitar sobrecarga
      try { await this.adzuna.importJobs(); } catch (e) { this.logger.error(`Erro Adzuna: ${e.message}`); }
      
      // Pequena pausa para respirar
      await new Promise(r => setTimeout(r, 1000));
      
      try { await this.remotive.importJobs(); } catch (e) { this.logger.error(`Erro Remotive: ${e.message}`); }
      
      try { await this.programathor.scrape(); } catch (e) { this.logger.error(`Erro Programathor: ${e.message}`); }

    } finally {
      this.isRunning = false; // DESTRAVA SEMPRE (mesmo se der erro)
      this.logger.log('💤 [CRAWLER] Ingestão diária finalizada.');
    }
  }

  async runManual() {
    console.log('🔥 [DEBUG] Botão manual apertado');
    
    if (this.isRunning) {
      return { message: 'Crawler já está rodando em background! Aguarde terminar.' };
    }
    
    // Dispara sem await (fire and forget)
    this.handleDailyIngestion();
    return { message: 'Crawler iniciado em background' };
  }

  // ... (Mantenha o método crawlAllCompanies abaixo igual estava) ...
  async crawlAllCompanies() {
    // ... Copie o conteúdo do crawlAllCompanies do arquivo anterior ou mantenha se já estiver lá
     this.logger.log('🤖 Iniciando crawler ATS para empresas cadastradas...');
    
    const companies = await this.prisma.company.findMany({
      where: { atsProvider: { not: null } }
    });

    let totalNewJobs = 0;

    for (const company of companies) {
      this.logger.log(`Crawling: ${company.name} [${company.atsProvider}]`);
      let jobs: any[] = [];

      try {
        switch (company.atsProvider) {
          case AtsType.greenhouse:
            if (company.careerPageUrl) jobs = await this.greenhouse.listJobs(company.careerPageUrl);
            break;
          case AtsType.lever:
            if (company.careerPageUrl) jobs = await this.lever.listJobs(company.careerPageUrl);
            break;
          case AtsType.gupy:
            if (company.careerPageUrl) jobs = await this.gupy.listJobs(company.careerPageUrl);
            break;
          case AtsType.workday:
             // Workday manual implementation needed
            break;
        }

        if (jobs.length > 0) {
          for (const jobData of jobs) {
            const sourceKey = jobData.externalId || jobData.applyUrl;
            let sourceType: JobSourceType = JobSourceType.manual;
            if (company.atsProvider === AtsType.greenhouse) sourceType = JobSourceType.greenhouse;
            if (company.atsProvider === AtsType.lever) sourceType = JobSourceType.lever;
            if (company.atsProvider === AtsType.gupy) sourceType = JobSourceType.gupy;

            await this.prisma.job.upsert({
              where: { sourceType_sourceKey: { sourceType, sourceKey } },
              update: {},
              create: {
                title: jobData.title,
                description: jobData.description || 'Ver no site oficial',
                location: jobData.location,
                remote: jobData.remote || false,
                applyUrl: jobData.applyUrl,
                sourceType: sourceType,
                sourceKey: sourceKey,
                atsType: company.atsProvider,
                companyId: company.id,
                postedAt: jobData.postedAt || new Date(),
              }
            });
            totalNewJobs++;
          }
        }
      } catch (error) {
        this.logger.error(`Erro ao processar ${company.name}: ${error.message}`);
      }
    }
    return { success: true, processed: companies.length };
  }
}
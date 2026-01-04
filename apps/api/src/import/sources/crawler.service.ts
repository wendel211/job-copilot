import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AdzunaService } from './adzuna.service';
import { ProgramathorService } from './programathor.service';
import { RemotiveService } from './remotive.service';

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  constructor(
    private readonly adzuna: AdzunaService,
    private readonly programathor: ProgramathorService,
    private readonly remotive: RemotiveService, 
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleDailyIngestion() {
    this.logger.log('🚀 [CRAWLER] A iniciar ingestão diária de vagas...');
    

    await this.adzuna.importJobs();
    await this.remotive.importJobs(); 
    await this.programathor.scrape();
    
    this.logger.log('💤 [CRAWLER] Ingestão diária finalizada.');
  }

  async runManual() {

    this.handleDailyIngestion();
    return { message: 'Crawler iniciado em background' };
  }
}
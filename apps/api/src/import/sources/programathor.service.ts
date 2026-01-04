import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaService } from '../../../prisma/prisma.service';
import { JobSourceType, AtsType } from '@prisma/client';

@Injectable()
export class ProgramathorService {
  private readonly logger = new Logger(ProgramathorService.name);
  private readonly BASE_URL = 'https://programathor.com.br/jobs';

  constructor(private prisma: PrismaService) {}

  async scrape() {
    try {
      this.logger.log('🔄 Iniciando scrap do Programathor...');
      const { data } = await axios.get(this.BASE_URL);
      const $ = cheerio.load(data);
      let count = 0;

      // O Programathor lista vagas em .cell-list
      const jobElements = $('.cell-list');

      for (const el of jobElements) {
        const title = $(el).find('.cell-list-content h3').text().trim();
        const companyName = $(el).find('.cell-list-content span').first().text().trim();
        const relativeLink = $(el).find('a').attr('href');
        
        if (!title || !relativeLink) continue;

        const fullLink = `https://programathor.com.br${relativeLink}`;
        // ID único baseado na URL (ex: /jobs/12345-nome -> 12345)
        const sourceKey = relativeLink.split('/jobs/')[1]?.split('-')[0];

        if (!sourceKey) continue;

        // 1. Garante empresa
        const company = await this.prisma.company.upsert({
          where: { name: companyName },
          update: {},
          create: { name: companyName },
        });

        // 2. Salva Vaga
        await this.prisma.job.upsert({
          where: {
            sourceType_sourceKey: {
              sourceType: JobSourceType.programathor,
              sourceKey: sourceKey,
            },
          },
          update: {},
          create: {
            title,
            description: `Vaga encontrada no Programathor. Acesse o link para ver os requisitos completos.`,
            location: 'Brasil',
            remote: title.toLowerCase().includes('remoto') || title.toLowerCase().includes('remote'),
            applyUrl: fullLink,
            sourceType: JobSourceType.programathor,
            sourceKey: sourceKey,
            atsType: AtsType.unknown,
            companyId: company.id,
            postedAt: new Date(),
          },
        });
        count++;
      }

      this.logger.log(`✅ Programathor: ${count} vagas processadas.`);
    } catch (error) {
      this.logger.error('❌ Erro no Programathor Scraper:', error.message);
    }
  }
}
import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { JobScraper, ScrapedJob } from './scraper.interface';

/**
 * Scraper simplificado para Greenhouse.
 */
@Injectable()
export class GreenhouseScraper implements JobScraper {
  private readonly logger = new Logger(GreenhouseScraper.name);

  canHandle(url: string): boolean {
    return url.includes('greenhouse.io');
  }

  async scrape(url: string, html: string): Promise<ScrapedJob> {
    const $ = cheerio.load(html);

    const title = $('h1').first().text().trim() || 'Vaga Greenhouse';
    const company = $("meta[property='og:site_name']").attr('content') || 'Empresa';
    const location = $('.location').first().text().trim() || null;
    const isRemote = location?.toLowerCase().includes('remote') || false;

    // Descrição mínima
    const description = 'Descrição pendente. Clique em "Editar" para adicionar.';

    this.logger.log(`GreenhouseScraper: ${title} @ ${company}`);

    return {
      title,
      description,
      location,
      remote: isRemote,
      applyUrl: url,
      company: { name: company },
      postedAt: new Date(),
    };
  }

  async listJobs(boardSlug: string): Promise<ScrapedJob[]> {
    try {
      const { data } = await axios.get(
        `https://boards-api.greenhouse.io/v1/boards/${boardSlug}/jobs?content=true`
      );

      return (data.jobs || []).map((job: any) => ({
        title: job.title,
        description: job.content ? cheerio.load(job.content).text().trim() : '',
        location: job.location?.name || null,
        remote: job.location?.name?.toLowerCase().includes('remote') || false,
        applyUrl: job.absolute_url,
        company: { name: boardSlug },
        postedAt: job.updated_at ? new Date(job.updated_at) : new Date(),
      }));
    } catch (error) {
      this.logger.error(`Erro Greenhouse listJobs: ${boardSlug}`, error);
      return [];
    }
  }
}
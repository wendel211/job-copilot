import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { JobScraper, ScrapedJob } from './scraper.interface';

/**
 * Scraper simplificado para Lever.
 */
@Injectable()
export class LeverScraper implements JobScraper {
  private readonly logger = new Logger(LeverScraper.name);

  canHandle(url: string): boolean {
    return url.includes('lever.co');
  }

  async scrape(url: string, html: string): Promise<ScrapedJob> {
    const $ = cheerio.load(html);

    const title = $('h2.title').text().trim() || $('title').text().trim() || 'Vaga Lever';
    const company = $("meta[property='og:site_name']").attr('content') || 'Empresa';
    const location = $('.location').text().trim() || null;
    const isRemote = location?.toLowerCase().includes('remote') || false;

    // Descrição mínima
    const description = 'Descrição pendente. Clique em "Editar" para adicionar.';

    this.logger.log(`LeverScraper: ${title} @ ${company}`);

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

  async listJobs(slug: string): Promise<ScrapedJob[]> {
    try {
      const { data } = await axios.get(`https://api.lever.co/v0/postings/${slug}`);

      return (data || []).map((job: any) => ({
        title: job.text,
        description: job.descriptionPlain || '',
        location: job.categories?.location || null,
        remote: job.workplaceType === 'remote',
        applyUrl: job.hostedUrl,
        company: { name: slug },
        postedAt: job.createdAt ? new Date(job.createdAt) : new Date(),
      }));
    } catch (error) {
      this.logger.error(`Erro Lever listJobs: ${slug}`, error);
      return [];
    }
  }
}
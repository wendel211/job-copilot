import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { JobScraper, ScrapedJob } from './scraper.interface';

@Injectable()
export class LeverScraper implements JobScraper {
  private readonly logger = new Logger(LeverScraper.name);

  canHandle(url: string): boolean {
    return url.includes('lever.co');
  }

  // ===========================================================================
  // MODO 1: SCRAPE UNITÁRIO (IMPORTAÇÃO MANUAL)
  // ===========================================================================
  async scrape(url: string, html: string): Promise<ScrapedJob> {
    const $ = cheerio.load(html);

    const title = $('h2.title').text().trim() || $('title').text().trim();

    const description =
      $('.section-wrapper').text().trim() ||
      $('body').text().trim();

    const company =
      $("meta[property='og:site_name']").attr('content') ||
      $('title').text().split('-').pop()?.trim() ||
      'Empresa';

    const location = $('.location').text().trim() || null;

    return {
      title,
      description,
      location,
      remote: description.toLowerCase().includes('remote') || location?.toLowerCase().includes('remote') || false,
      applyUrl: url,
      company: { name: company },
      postedAt: null, // Lever HTML nem sempre expõe a data facilmente
    };
  }

  // ===========================================================================
  // MODO 2: LISTAGEM VIA API (CRAWLER AUTOMÁTICO)
  // ===========================================================================
  /**
   * Busca todas as vagas ativas de uma empresa usando a API pública do Lever.
   * @param slug O identificador da empresa (ex: 'netflix' em jobs.lever.co/netflix)
   */
  async listJobs(slug: string): Promise<ScrapedJob[]> {
    try {
      // API Oficial: https://api.lever.co/v0/postings/{slug}
      const apiUrl = `https://api.lever.co/v0/postings/${slug}`;
      
      this.logger.log(`Buscando vagas na API Lever: ${apiUrl}`);
      
      const { data } = await axios.get(apiUrl);

      if (!Array.isArray(data)) {
        this.logger.warn(`Formato inesperado na resposta do Lever para: ${slug}`);
        return [];
      }

      return data.map((job: any) => ({
        title: job.text,
        description: job.descriptionPlain || job.description || '', // Lever fornece texto puro ou HTML
        location: job.categories?.location || null,
        remote: job.workplaceType === 'remote', // Campo explícito na API deles
        applyUrl: job.hostedUrl,
        company: { name: slug }, // O CrawlerService ajustará para o nome real da Company
        postedAt: job.createdAt ? new Date(job.createdAt) : new Date(),
        externalId: String(job.id),
      }));

    } catch (error) {
      this.logger.error(`Erro ao listar vagas Lever para ${slug}`, error);
      return [];
    }
  }
}
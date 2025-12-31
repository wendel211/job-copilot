import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { JobScraper, ScrapedJob } from './scraper.interface';

@Injectable()
export class GreenhouseScraper implements JobScraper {
  private readonly logger = new Logger(GreenhouseScraper.name);

  canHandle(url: string): boolean {
    return url.includes('greenhouse.io');
  }

  // ===========================================================================
  // MODO 1: SCRAPE UNITÁRIO (IMPORTAÇÃO MANUAL)
  // ===========================================================================
  async scrape(url: string, html: string): Promise<ScrapedJob> {
    const $ = cheerio.load(html);

    const title =
      $('h1').first().text().trim() ||
      $("meta[property='og:title']").attr('content') ||
      'Vaga';

    const description =
      $('#content').text().trim() ||
      $('.content').text().trim() ||
      $('body').text().trim();

    const company =
      $("meta[property='og:site_name']").attr('content') ||
      $('title').text().split('-').pop()?.trim() ||
      'Empresa';

    const location =
      $('.location').first().text().trim() ||
      $("[data-mapped='true']").text().trim() ||
      null;

    const postedText =
      $("meta[property='article:published_time']").attr('content') || null;

    return {
      title,
      description,
      location,
      remote: description.toLowerCase().includes('remote') || location?.toLowerCase().includes('remote') || false,
      applyUrl: url,
      company: { name: company },
      postedAt: postedText ? new Date(postedText) : new Date(),
    };
  }

  // ===========================================================================
  // MODO 2: LISTAGEM VIA API (CRAWLER AUTOMÁTICO)
  // ===========================================================================
  /**
   * Busca todas as vagas ativas de uma empresa usando a API pública do Greenhouse.
   * @param boardSlug O identificador da empresa na URL (ex: 'nubank' em boards.greenhouse.io/nubank)
   */
  async listJobs(boardSlug: string): Promise<ScrapedJob[]> {
    try {

      const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${boardSlug}/jobs?content=true`;
      
      this.logger.log(`Buscando vagas na API Greenhouse: ${apiUrl}`);
      
      const { data } = await axios.get(apiUrl);

      if (!data.jobs || !Array.isArray(data.jobs)) {
        this.logger.warn(`Nenhuma vaga encontrada para o slug: ${boardSlug}`);
        return [];
      }

      return data.jobs.map((job: any) => {
        // Greenhouse retorna HTML no campo content. Decodificamos para texto limpo se necessário,
        // mas aqui vamos manter o HTML para preservar formatação ou limpar tags básicas.
        const description = job.content 
          ? cheerio.load(job.content).text().trim() // Remove HTML tags para salvar limpo
          : '';

        return {
          title: job.title,
          description: description,
          location: job.location?.name || null,
          remote: job.location?.name?.toLowerCase().includes('remote') || false,
          applyUrl: job.absolute_url,
          company: { name: boardSlug }, // O nome real será atualizado no service se necessário
          postedAt: job.updated_at ? new Date(job.updated_at) : new Date(),
          externalId: String(job.id), 
        };
      });

    } catch (error) {
      this.logger.error(`Erro ao listar vagas Greenhouse para ${boardSlug}`, error);
      return [];
    }
  }
}
import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { JobScraper, ScrapedJob } from './scraper.interface';

/**
 * Scraper simplificado para Gupy.
 * Extrai dados básicos - descrição completa é preenchida manualmente.
 */
@Injectable()
export class GupyScraper implements JobScraper {
  private readonly logger = new Logger(GupyScraper.name);

  canHandle(url: string): boolean {
    return url.includes('gupy.io');
  }

  async scrape(url: string, html: string): Promise<ScrapedJob> {
    const $ = cheerio.load(html);

    // Tentar extrair dados do Next.js
    let jobProps: any = null;
    try {
      const scriptContent = $('#__NEXT_DATA__').html();
      if (scriptContent) {
        jobProps = JSON.parse(scriptContent)?.props?.pageProps?.job;
      }
    } catch { }

    const title = jobProps?.name || $('h1').first().text().trim() || 'Vaga Gupy';
    const company = jobProps?.careerPage?.name || $("meta[property='og:site_name']").attr('content') || 'Empresa';

    const location = jobProps?.address?.city && jobProps?.address?.state
      ? `${jobProps.address.city} - ${jobProps.address.state}`
      : null;

    const isRemote = jobProps?.isRemoteWork ||
      title.toLowerCase().includes('remoto') ||
      title.toLowerCase().includes('home office');

    // Descrição mínima - usuário preenche manualmente
    const description = 'Descrição pendente. Clique em "Editar" para adicionar.';

    this.logger.log(`GupyScraper: ${title} @ ${company}`);

    return {
      title,
      description,
      location,
      remote: isRemote,
      applyUrl: url,
      company: { name: company },
      postedAt: jobProps?.publishedDate ? new Date(jobProps.publishedDate) : new Date(),
    };
  }

  // Crawler para listagem automática de vagas
  async listJobs(slug: string): Promise<ScrapedJob[]> {
    try {
      const { data: html } = await axios.get(`https://${slug}.gupy.io/`);
      const match = html.match(/"jobBoardId":(\d+)/);
      if (!match) return [];

      const { data } = await axios.get(
        `https://portal.api.gupy.io/api/v1/jobs?jobBoardId=${match[1]}&limit=100`
      );

      return (data.data || []).map((job: any) => ({
        title: job.name,
        description: job.description || '',
        location: job.city && job.state ? `${job.city} - ${job.state}` : null,
        remote: job.isRemoteWork,
        applyUrl: job.jobUrl,
        company: { name: slug },
        postedAt: job.publishedDate ? new Date(job.publishedDate) : new Date(),
      }));
    } catch (error) {
      this.logger.error(`Erro Gupy listJobs: ${slug}`, error);
      return [];
    }
  }
}
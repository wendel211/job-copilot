import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { JobScraper, ScrapedJob } from './scraper.interface';

@Injectable()
export class GupyScraper implements JobScraper {
  private readonly logger = new Logger(GupyScraper.name);

  canHandle(url: string): boolean {
    return url.includes('gupy.io');
  }

  // ===========================================================================
  // MODO 1: SCRAPE UNITÁRIO (IMPORTAÇÃO MANUAL)
  // ===========================================================================
  async scrape(url: string, html: string): Promise<ScrapedJob> {
    const $ = cheerio.load(html);

    // Tenta pegar dados estruturados do Next.js (mais confiável)
    let nextData: any = null;
    try {
      const scriptContent = $('#__NEXT_DATA__').html();
      if (scriptContent) {
        nextData = JSON.parse(scriptContent);
      }
    } catch (e) {
      // Ignora erro e usa fallback visual
    }

    const jobProps = nextData?.props?.pageProps?.job;

    // Prioridade: Dados do JSON > Metatags > Seletores CSS
    const title =
      jobProps?.name ||
      $('h1').first().text().trim() ||
      $("meta[property='og:title']").attr('content') ||
      'Vaga Gupy';

    const description =
      jobProps?.description ||
      $('.description').html() || // Mantém HTML para formatação
      $('body').text().trim();

    const company =
      jobProps?.careerPage?.name ||
      $('.job-company-name').text().trim() ||
      $("meta[property='og:site_name']").attr('content') ||
      'Empresa';

    const location =
      (jobProps?.address?.city && jobProps?.address?.state 
        ? `${jobProps.address.city} - ${jobProps.address.state}` 
        : null) ||
      $('.job-location').text().trim() ||
      null;

    const isRemote = 
      jobProps?.isRemoteWork ||
      description.toLowerCase().includes('remoto') ||
      location?.toLowerCase().includes('remoto') ||
      false;

    return {
      title,
      description, // HTML limpo ou texto
      location,
      remote: isRemote,
      applyUrl: url,
      company: { name: company },
      postedAt: jobProps?.publishedDate ? new Date(jobProps.publishedDate) : new Date(),
    };
  }

  // ===========================================================================
  // MODO 2: LISTAGEM VIA API (CRAWLER AUTOMÁTICO)
  // ===========================================================================
  /**
   * Busca vagas na Gupy.
   * Estratégia: Acessar página principal -> Extrair jobBoardId -> Bater na API interna
   * @param slug O subdomínio da empresa (ex: 'nubank' em nubank.gupy.io)
   */
  async listJobs(slug: string): Promise<ScrapedJob[]> {
    try {
      // 1. Descobrir o ID da Empresa (jobBoardId)
      const homeUrl = `https://${slug}.gupy.io/`;
      this.logger.log(`Acessando home da Gupy para extrair ID: ${homeUrl}`);
      
      const { data: homeHtml } = await axios.get(homeUrl);
      
      // Procura pelo ID dentro do HTML (geralmente no __NEXT_DATA__ ou config)
      // Padrão comum: "jobBoardId":12345
      const match = homeHtml.match(/"jobBoardId":(\d+)/);
      const jobBoardId = match ? match[1] : null;

      if (!jobBoardId) {
        this.logger.warn(`Não foi possível encontrar jobBoardId para ${slug}`);
        return [];
      }

      // 2. Consultar API da Gupy com o ID encontrado
      // Endpoint: https://portal.api.gupy.io/api/v1/jobs?jobBoardId={id}&limit=100
      const apiUrl = `https://portal.api.gupy.io/api/v1/jobs?jobBoardId=${jobBoardId}&limit=100`;
      this.logger.log(`Consultando API Gupy: ${apiUrl}`);

      const { data: apiResponse } = await axios.get(apiUrl);

      if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
        return [];
      }

      // 3. Mapear resultados
      return apiResponse.data.map((job: any) => ({
        externalId: String(job.id),
        title: job.name,
        description: job.description, // Gupy API retorna HTML aqui
        location: job.city && job.state ? `${job.city} - ${job.state}` : 'Remoto/Brasil',
        remote: job.isRemoteWork,
        applyUrl: job.jobUrl,
        company: { name: slug }, // Nome provisório, o crawler ajusta se tiver info melhor
        postedAt: job.publishedDate ? new Date(job.publishedDate) : new Date(),
      }));

    } catch (error) {
      this.logger.error(`Erro ao listar vagas Gupy para ${slug}`, error);
      return [];
    }
  }
}
import { Injectable, Logger } from "@nestjs/common";
import * as cheerio from "cheerio";
import { JobScraper, ScrapedJob } from "./scraper.interface";

/**
 * Scraper simplificado para Workday.
 */
@Injectable()
export class WorkdayScraper implements JobScraper {
  private readonly logger = new Logger(WorkdayScraper.name);

  canHandle(url: string): boolean {
    return url.includes("workday");
  }

  async scrape(url: string, html: string): Promise<ScrapedJob> {
    const $ = cheerio.load(html);

    const title = $("h1").first().text().trim() || "Vaga Workday";
    const company = $("meta[property='og:site_name']").attr("content") || "Empresa";
    const location = $("div[data-automation-id='locations']").text().trim() || null;
    const isRemote = location?.toLowerCase().includes("remote") || false;

    // Descrição mínima
    const description = 'Descrição pendente. Clique em "Editar" para adicionar.';

    this.logger.log(`WorkdayScraper: ${title} @ ${company}`);

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
}

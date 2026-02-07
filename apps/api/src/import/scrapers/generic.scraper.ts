import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { JobScraper, ScrapedJob } from './scraper.interface';

/**
 * Scraper genérico simplificado.
 * Extrai apenas dados básicos (título, empresa, localização).
 * A descrição completa é preenchida manualmente pelo usuário.
 */
@Injectable()
export class GenericScraper implements JobScraper {
    private readonly logger = new Logger(GenericScraper.name);

    canHandle(): boolean {
        return true;
    }

    async scrape(url: string, html: string): Promise<ScrapedJob> {
        const $ = cheerio.load(html);

        // Remove elementos irrelevantes
        $('script, style, nav, footer, iframe, noscript').remove();

        const title = this.extractTitle($);
        const company = this.extractCompany($, url);
        const location = this.extractLocation($);
        const isRemote = this.detectRemote($, title, location);

        // Descrição mínima - usuário vai preencher manualmente
        const description = 'Descrição pendente. Clique em "Editar" para adicionar.';

        this.logger.log(`GenericScraper: ${title} @ ${company}`);

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

    private extractTitle($: cheerio.CheerioAPI): string {
        // h1 > og:title > title
        const h1 = $('h1').first().text().trim();
        if (h1 && h1.length > 3 && h1.length < 150) return h1;

        const ogTitle = $("meta[property='og:title']").attr('content');
        if (ogTitle) return ogTitle.trim().split(/[|–-]/)[0].trim();

        const pageTitle = $('title').text().trim();
        if (pageTitle) return pageTitle.split(/[|–-]/)[0].trim();

        return 'Vaga Importada';
    }

    private extractCompany($: cheerio.CheerioAPI, url: string): string {
        const ogSite = $("meta[property='og:site_name']").attr('content');
        if (ogSite) return ogSite.trim();

        // Extrair do título da página (parte após | ou -)
        const title = $('title').text();
        const parts = title.split(/[|–-]/);
        if (parts.length > 1) {
            const last = parts[parts.length - 1].trim();
            if (last.length > 2 && last.length < 50) return last;
        }

        // Fallback: domínio
        try {
            return new URL(url).hostname.replace('www.', '').split('.')[0] || 'Empresa';
        } catch {
            return 'Empresa';
        }
    }

    private extractLocation($: cheerio.CheerioAPI): string | null {
        const selectors = ['.location', '.job-location', '[class*="location"]'];
        for (const sel of selectors) {
            const text = $(sel).first().text().trim();
            if (text && text.length > 2 && text.length < 80) return text;
        }
        return null;
    }

    private detectRemote($: cheerio.CheerioAPI, title: string, location: string | null): boolean {
        const text = (title + ' ' + (location || '')).toLowerCase();
        return /\b(remoto|remote|home.?office|anywhere)\b/i.test(text);
    }
}

import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ImportJobDto } from "../jobs/dto/import-job.dto";

import { detectATS } from "../jobs/utils/ats-detector";

import { GreenhouseScraper } from "./scrapers/greenhouse.scraper";
import { LeverScraper } from "./scrapers/lever.scraper";
import { WorkdayScraper } from "./scrapers/workday.scraper";
import { GupyScraper } from "./scrapers/gupy.scraper";
import { GenericScraper } from "./scrapers/generic.scraper";

import { fetchHtml } from "./utils/fetch-html";
import { fetchDynamicHtml } from "./utils/playwright-fallback";

import { EventsService } from "../events/events.service";
import { EventType } from "../events/enums/event-type.enum";

import { JobSourceType } from "@prisma/client";

import { CreditsService } from "../credits/credits.service";

@Injectable()
export class ImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly greenhouse: GreenhouseScraper,
    private readonly lever: LeverScraper,
    private readonly workday: WorkdayScraper,
    private readonly gupy: GupyScraper,
    private readonly generic: GenericScraper,
    private readonly events: EventsService,
    private readonly credits: CreditsService,
  ) { }

  // ===================================================================
  // IMPORTAÇÃO COMPLETA DE UMA VAGA
  // ===================================================================
  async importFromLink(dto: ImportJobDto) {
    if (!dto.url) {
      throw new BadRequestException("URL é obrigatória");
    }

    // ------------------------------------------------------------
    // 0. VALIDAR CRÉDITOS (OBRIGATÓRIO PARA IMPORTAR)
    // ------------------------------------------------------------
    if (!dto.userId) {
      throw new BadRequestException("Usuário não identificado");
    }

    const hasCredits = await this.credits.hasCredits(dto.userId);
    if (!hasCredits) {
      throw new BadRequestException("Sem créditos disponíveis. Compre mais para continuar importando.");
    }

    // ------------------------------------------------------------
    // 1. Buscar HTML com fallback Playwright
    // ------------------------------------------------------------
    let html = await fetchHtml(dto.url);

    if (!html || html.length < 2000) {
      html = await fetchDynamicHtml(dto.url);
    }

    // ------------------------------------------------------------
    // 2. Detectar ATS
    // ------------------------------------------------------------
    const ats = detectATS(dto.url);
    const scraper = this.getScraper(ats);
    // GenericScraper sempre será retornado como fallback, então nunca será null

    // ------------------------------------------------------------
    // 3. Extrair dados via scraper
    // ------------------------------------------------------------
    const jobData = await scraper.scrape(dto.url, html);

    if (!jobData) {
      throw new NotFoundException("Falha ao extrair dados da vaga");
    }

    // ------------------------------------------------------------
    // 4. Criar/Atualizar empresa (UPsert)
    // ------------------------------------------------------------
    const company = await this.prisma.company.upsert({
      where: { name: jobData.company.name },
      create: {
        name: jobData.company.name,
        website: jobData.company.website,
      },
      update: {}, // não atualizamos empresa automaticamente
    });

    // ------------------------------------------------------------
    // 5. Criar/Atualizar Job por sourceKey (UPsert)
    // ------------------------------------------------------------
    const sourceKey = `url:${dto.url}`;

    const job = await this.prisma.job.upsert({
      where: {
        sourceType_sourceKey: {
          sourceType: JobSourceType.manual,
          sourceKey,
        },
      },
      create: {
        sourceType: JobSourceType.manual,
        sourceKey,
        atsType: ats,
        title: jobData.title,
        description: jobData.description,
        remote: jobData.remote ?? false,
        location: jobData.location ?? null,
        applyUrl: jobData.applyUrl,
        companyId: company.id,
        postedAt: jobData.postedAt,
      },
      update: {
        title: jobData.title,
        description: jobData.description,
        remote: jobData.remote ?? false,
        location: jobData.location ?? null,
        postedAt: jobData.postedAt,
        companyId: company.id,
      },
      include: { company: true },
    });

    // ------------------------------------------------------------
    // 6. [REMOVIDO] Criar SavedJob Automático
    // ------------------------------------------------------------
    // Alteração: Não criamos mais o SavedJob aqui.
    // O usuário deve clicar explicitamente em "Salvar" ou "Já Apliquei" no frontend.

    // ------------------------------------------------------------
    // 7. Registrar evento JOB_IMPORTED
    // ------------------------------------------------------------
    await this.events.register({
      type: EventType.JOB_IMPORTED,
      userId: dto.userId ?? null,
      jobId: job.id,
      savedJobId: null, // Agora é null pois não foi salvo no pipeline ainda
      metadata: {
        url: dto.url,
        ats,
        company: job.company.name,
        sourceKey,
      },
    });

    // ------------------------------------------------------------
    // 8. CONSUMIR CRÉDITO (após importação bem-sucedida)
    // ------------------------------------------------------------
    await this.credits.useCredit(dto.userId!);

    // ------------------------------------------------------------
    // 9. Retorno final
    // ------------------------------------------------------------
    return {
      created: true,
      job,
    };
  }


  private getScraper(ats: string) {
    switch (ats) {
      case "greenhouse":
        return this.greenhouse;
      case "lever":
        return this.lever;
      case "workday":
        return this.workday;
      case "gupy":
        return this.gupy;
      default:
        // Fallback: usar scraper genérico para qualquer outro site
        return this.generic;
    }
  }
}
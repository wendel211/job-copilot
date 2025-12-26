import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ImportJobDto } from "../jobs/dto/import-job.dto";

import { detectATS } from "../jobs/utils/ats-detector";

import { GreenhouseScraper } from "./scrapers/greenhouse.scraper";
import { LeverScraper } from "./scrapers/lever.scraper";
import { WorkdayScraper } from "./scrapers/workday.scraper";
import { GupyScraper } from "./scrapers/gupy.scraper";

import { fetchHtml } from "./utils/fetch-html";
import { fetchDynamicHtml } from "./utils/playwright-fallback";

import { EventsService } from "../events/events.service";
import { EventType } from "../events/enums/event-type.enum";

import { JobSourceType, SavedJob } from "@prisma/client";

@Injectable()
export class ImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly greenhouse: GreenhouseScraper,
    private readonly lever: LeverScraper,
    private readonly workday: WorkdayScraper,
    private readonly gupy: GupyScraper,
    private readonly events: EventsService,
  ) {}

  // ===================================================================
  // IMPORTAÇÃO COMPLETA DE UMA VAGA
  // ===================================================================
  async importFromLink(dto: ImportJobDto) {
    if (!dto.url) {
      throw new BadRequestException("URL é obrigatória");
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

    if (!scraper) {
      throw new BadRequestException(`ATS não suportado: ${ats}`);
    }

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
        companyId: company.id, // ← RELAÇÃO CORRETA
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
    // 6. Criar SavedJob se userId estiver presente
    // ------------------------------------------------------------
    let savedJob: SavedJob | null = null;

    if (dto.userId) {
      savedJob = await this.prisma.savedJob.upsert({
        where: { userId_jobId: { userId: dto.userId, jobId: job.id } },
        create: { userId: dto.userId, jobId: job.id },
        update: {},
      });
    }

    // ------------------------------------------------------------
    // 7. Registrar evento JOB_IMPORTED
    // ------------------------------------------------------------
    await this.events.register({
      type: EventType.JOB_IMPORTED,
      userId: dto.userId ?? null,
      jobId: job.id,
      savedJobId: savedJob?.id ?? null,
      metadata: {
        url: dto.url,
        ats,
        company: job.company.name,
        sourceKey,
      },
    });

    // ------------------------------------------------------------
    // 8. Retorno final
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
        return null;
    }
  }
}

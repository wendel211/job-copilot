import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ImportJobDto } from "../jobs/dto/import-job.dto";
import { detectATS } from "../jobs/utils/ats-detector";

import { GreenhouseScraper } from "./scrapers/greenhouse.scraper";
import { LeverScraper } from "./scrapers/lever.scraper";
import { WorkdayScraper } from "./scrapers/workday.scraper";
import { GupyScraper } from "./scrapers/gupy.scraper";

import { fetchHtml } from "./utils/fetch-html";
import { fetchDynamicHtml } from "./utils/playwright-fallback";
import { JobSourceType } from "@prisma/client";

@Injectable()
export class ImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly greenhouse: GreenhouseScraper,
    private readonly lever: LeverScraper,
    private readonly workday: WorkdayScraper,
    private readonly gupy: GupyScraper,
  ) {}

  async importFromLink(dto: ImportJobDto) {
    if (!dto.url) {
      throw new BadRequestException("URL é obrigatória");
    }

    // 1) Fetch HTML
    let html = await fetchHtml(dto.url);

    if (!html || html.length < 2000) {
      // fallback automático se o site bloquear request normal
      html = await fetchDynamicHtml(dto.url);
    }

    // 2) Detectar ATS
    const ats = detectATS(dto.url);

    const scraper = this.getScraper(ats);
    if (!scraper) {
      throw new BadRequestException(`ATS não suportado: ${ats}`);
    }

    // 3) Extrair dados da vaga via scraper
    const jobData = await scraper.scrape(dto.url, html);

    // 4) Upsert da empresa
    const company = await this.prisma.company.upsert({
      where: { name: jobData.company.name },
      create: {
        name: jobData.company.name,
        website: jobData.company.website,
      },
      update: {},
    });

    // 5) Upsert do job via sourceKey
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
        location: jobData.location ?? null,
        remote: jobData.remote ?? false,
        postedAt: jobData.postedAt,
      },
      include: { company: true },
    });

    if (dto.userId) {
      await this.prisma.savedJob.upsert({
        where: { userId_jobId: { userId: dto.userId, jobId: job.id } },
        create: { userId: dto.userId, jobId: job.id },
        update: {},
      });
    }

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

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ImportLinkDto } from "./dto/import-link.dto";
import * as cheerio from "cheerio";
import { chromium } from "playwright";
import { AtsType, JobSourceType } from "@prisma/client";

type FetchResult = { html: string; finalUrl: string };

function detectAts(url: string): AtsType {
  const u = url.toLowerCase();
  if (u.includes("greenhouse.io")) return AtsType.greenhouse;
  if (u.includes("lever.co")) return AtsType.lever;
  if (u.includes("workday")) return AtsType.workday;
  if (u.includes("gupy.io") || u.includes("gupy.com.br")) return AtsType.gupy;
  return AtsType.unknown;
}

function guessCompanyFromTitle(title: string) {
  const parts = title
    .split(/[-|@–—]/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length >= 2) return parts[parts.length - 1];
  return "Empresa";
}

// CORREÇÃO AQUI: Permitir string, undefined ou null
function normalizeWhitespace(text: string | undefined | null) {
  return (text || "").replace(/\s+/g, " ").trim();
}

@Injectable()
export class ImportService {
  constructor(private readonly prisma: PrismaService) {}

  private async fetchHtml(url: string): Promise<FetchResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    };

    const looksEmpty = (html: string) =>
      !html ||
      html.length < 2000 ||
      (!html.includes("<body") && !html.includes("</html"));

    try {
      const res = await fetch(url, {
        redirect: "follow",
        headers,
        signal: controller.signal,
      });

      const html = await res.text();
      const finalUrl = res.url || url;

      if (!looksEmpty(html)) return { html, finalUrl };

      return await this.fetchHtmlWithPlaywright(url);
    } catch {
      return await this.fetchHtmlWithPlaywright(url);
    } finally {
      clearTimeout(timeout);
    }
  }

  private async fetchHtmlWithPlaywright(url: string): Promise<FetchResult> {
    const browser = await chromium.launch({ headless: true });

    try {
      const page = await browser.newPage({
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        locale: "pt-BR",
      });

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForTimeout(1500);

      const html = await page.content();
      const finalUrl = page.url();

      return { html, finalUrl };
    } finally {
      await browser.close();
    }
  }

  private extractJob(html: string, finalUrl: string) {
    const $ = cheerio.load(html);

    // Agora normalizeWhitespace aceita o retorno do .attr() sem reclamar
    const title =
      normalizeWhitespace($("meta[property='og:title']").attr("content")) ||
      normalizeWhitespace($("title").text()) ||
      "Vaga";

    const ogDesc = normalizeWhitespace(
      $("meta[property='og:description']").attr("content")
    );
    const metaDesc = normalizeWhitespace($("meta[name='description']").attr("content"));

    const richText =
      $("#content").text() ||
      $(".content").text() ||
      $("main").text() ||
      $("article").text() ||
      $(".job__description, .job-description, .job, #job").text() ||
      $("body").text();

    const bodyText = normalizeWhitespace(richText).slice(0, 15000);

    const description = [ogDesc, metaDesc, bodyText].filter(Boolean).join("\n\n").trim();

    const atsType = detectAts(finalUrl); 
    const companyName = guessCompanyFromTitle(title);

    const haystack = (title + " " + description).toLowerCase();
    const remote = haystack.includes("remoto") || haystack.includes("remote");

    const locationGuess =
      normalizeWhitespace($("[data-testid='job-location']").text()) ||
      normalizeWhitespace($(".location, .job-location, [class*='location']").first().text()) ||
      undefined;

    return {
      title,
      description,
      applyUrl: finalUrl,
      atsType,        
      companyName,
      remote,
      location: locationGuess,
    };
  }

  async importByLink(dto: ImportLinkDto) {
    const { html, finalUrl } = await this.fetchHtml(dto.url);
    const parsed = this.extractJob(html, finalUrl);

    const sourceKey = `url:${finalUrl}`;

    let company = await this.prisma.company.findFirst({
      where: { name: parsed.companyName },
    });

    if (!company) {
      company = await this.prisma.company.create({
        data: { name: parsed.companyName },
      });
    }

    const existing = await this.prisma.job.findFirst({
      where: { sourceType: JobSourceType.manual, sourceKey },
      include: { company: true },
    });

    if (existing) {
      return { created: false, job: existing };
    }

    const job = await this.prisma.job.create({
      data: {
        sourceType: JobSourceType.manual,
        sourceKey,
        atsType: parsed.atsType, 
        title: parsed.title,
        location: parsed.location, // Certifique-se que no schema.prisma location é String? (opcional)
        remote: parsed.remote,
        description: parsed.description || "Descrição não extraída.",
        applyUrl: parsed.applyUrl,
        companyId: company.id,
      },
      include: { company: true },
    });

    await this.prisma.savedJob.upsert({
      where: { userId_jobId: { userId: dto.userId, jobId: job.id } },
      update: {},
      create: { userId: dto.userId, jobId: job.id, status: "discovered" },
    });

    return { created: true, job };
  }
}
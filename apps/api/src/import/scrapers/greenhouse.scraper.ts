import { Injectable } from "@nestjs/common";
import * as cheerio from "cheerio";
import { JobScraper, ScrapedJob } from "./scraper.interface";

@Injectable()
export class GreenhouseScraper implements JobScraper {
  canHandle(url: string): boolean {
    return url.includes("greenhouse.io");
  }

  async scrape(url: string, html: string): Promise<ScrapedJob> {
    const $ = cheerio.load(html);

    const title =
      $("h1").first().text().trim() ||
      $("meta[property='og:title']").attr("content") ||
      "Vaga";

    const description =
      $("#content").text().trim() ||
      $(".content").text().trim() ||
      $("body").text().trim();

    const company =
      $("meta[property='og:site_name']").attr("content") ||
      $("title").text().split("-").pop()?.trim() ||
      "Empresa";

    const location =
      $(".location").first().text().trim() ||
      $("[data-mapped='true']").text().trim() ||
      null;

    const postedText =
      $("meta[property='article:published_time']").attr("content") || null;

    return {
      title,
      description,
      location,
      remote: description.toLowerCase().includes("remote"),
      applyUrl: url,
      company: { name: company },
      postedAt: postedText ? new Date(postedText) : null,
    };
  }
}

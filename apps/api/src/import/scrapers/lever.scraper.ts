
import { Injectable } from "@nestjs/common";
import * as cheerio from "cheerio";
import { JobScraper, ScrapedJob } from "./scraper.interface";

@Injectable()
export class LeverScraper implements JobScraper {
  canHandle(url: string): boolean {
    return url.includes("lever.co");
  }

  async scrape(url: string, html: string): Promise<ScrapedJob> {
    const $ = cheerio.load(html);

    const title = $("h2.title").text().trim() || $("title").text().trim();

    const description =
      $(".section-wrapper").text().trim() ||
      $("body").text().trim();

    const company =
      $("meta[property='og:site_name']").attr("content") ||
      $("title").text().split("-").pop()?.trim() ||
      "Empresa";

    const location = $(".location").text().trim() || null;

    return {
      title,
      description,
      location,
      remote: description.toLowerCase().includes("remote"),
      applyUrl: url,
      company: { name: company },
      postedAt: null,
    };
  }
}

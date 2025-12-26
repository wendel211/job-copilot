import { Injectable } from "@nestjs/common";
import * as cheerio from "cheerio";
import { JobScraper, ScrapedJob } from "./scraper.interface";

@Injectable()
export class GupyScraper implements JobScraper {
  canHandle(url: string): boolean {
    return url.includes("gupy");
  }

  async scrape(url: string, html: string): Promise<ScrapedJob> {
    const $ = cheerio.load(html);

    const title =
      $("h1").first().text().trim() ||
      $("meta[property='og:title']").attr("content") ||
      "Vaga";

    const description =
      $(".description").text().trim() ||
      $("body").text().trim();

    const company =
      $(".job-company-name").text().trim() ||
      $("meta[property='og:site_name']").attr("content") ||
      "Empresa";

    const location =
      $(".job-location").text().trim() ||
      null;

    return {
      title,
      description,
      location,
      remote: description.toLowerCase().includes("remoto"),
      applyUrl: url,
      company: { name: company },
      postedAt: null,
    };
  }
}

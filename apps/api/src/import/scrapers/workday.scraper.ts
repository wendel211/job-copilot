import { Injectable } from "@nestjs/common";
import * as cheerio from "cheerio";
import { JobScraper, ScrapedJob } from "./scraper.interface";

@Injectable()
export class WorkdayScraper implements JobScraper {
  canHandle(url: string): boolean {
    return url.includes("workday");
  }

  async scrape(url: string, html: string): Promise<ScrapedJob> {
    const $ = cheerio.load(html);

    const title =
      $("h1").first().text().trim() ||
      $("meta[property='og:title']").attr("content") ||
      "Vaga";

    const description =
      $("section[data-automation-id='jobPostingDescription']").text().trim() ||
      $("body").text().trim();

    const company =
      $("meta[property='og:site_name']").attr("content") ||
      "Empresa";

    const location =
      $("div[data-automation-id='locations']").text().trim() ||
      null;

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

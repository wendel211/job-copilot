import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ImportService } from "./import.service";
import { CrawlerService } from "./crawler.service"; 
import { ImportJobDto } from "../jobs/dto/import-job.dto";

@ApiTags("Import")
@Controller("import")
export class ImportController {
  constructor(
    private readonly importService: ImportService,
    private readonly crawlerService: CrawlerService 
  ) {}

  // 1. Importação Manual (Link específico)
  @Post("link")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Importar vaga via Link (LinkedIn, Gupy, etc)" })
  async importFromLink(@Body() dto: ImportJobDto) {
    const result = await this.importService.importFromLink(dto);

    return {
      success: true,
      created: result.created,
      job: result.job,
    };
  }

  // 2. Crawler de ATS (Empresas específicas cadastradas: Nubank, Netflix...)
  @Post("crawl")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Disparar Crawler de Empresas ATS (Nível 2)" })
  async runAtsCrawler() {
    const result = await this.crawlerService.crawlAllCompanies();
    
    return {
      success: true,
      ...result,
    };
  }

  @Post("crawler/run")
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: "Disparar Crawler Zero-Cost (Adzuna, Remotive, Programathor)" })
  async runDiscoveryCrawler() {

    this.crawlerService.runManual(); 
    
    return { 
      message: "Crawler de descoberta iniciado em background! Verifique os logs do terminal.",
      sources: ["Adzuna", "Remotive", "Programathor"]
    };
  }
}
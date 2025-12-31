import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ImportService } from "./import.service";
import { CrawlerService } from "./crawler.service"; // <--- Importe o CrawlerService
import { ImportJobDto } from "../jobs/dto/import-job.dto";

@ApiTags("Import")
@Controller("import")
export class ImportController {
  constructor(
    private readonly importService: ImportService,
    private readonly crawlerService: CrawlerService // <--- Injete aqui
  ) {}

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


  @Post("crawl")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Disparar Crawler de Empresas (Nível 2)" })
  async runCrawler() {
    const result = await this.crawlerService.crawlAllCompanies();
    
    return {
      success: true,
      ...result,
    };
  }
}
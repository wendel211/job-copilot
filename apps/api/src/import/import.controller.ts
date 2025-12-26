import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger"; // 1. Imports Swagger
import { ImportService } from "./import.service";
import { ImportJobDto } from "../jobs/dto/import-job.dto";

@ApiTags("Import") // 2. Tag para agrupar
@Controller("import")
export class ImportController {
  constructor(private readonly importService: ImportService) {}

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
}
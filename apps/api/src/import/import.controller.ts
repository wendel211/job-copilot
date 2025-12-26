import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ImportService } from "./import.service";
import { ImportJobDto } from "../jobs/dto/import-job.dto";

@Controller("import")
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post("link")
  @HttpCode(HttpStatus.OK)
  async importFromLink(@Body() dto: ImportJobDto) {
    const result = await this.importService.importFromLink(dto);

    return {
      success: true,
      created: result.created,
      job: result.job,
    };
  }
}

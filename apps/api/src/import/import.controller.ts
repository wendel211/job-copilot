import { Controller, Post, Body } from "@nestjs/common";
import { ImportService } from "./import.service";
import { ImportJobDto } from "../jobs/dto/import-job.dto";

@Controller("import")
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post("link")
  importFromLink(@Body() dto: ImportJobDto) {
    return this.importService.importFromLink(dto);
  }
}

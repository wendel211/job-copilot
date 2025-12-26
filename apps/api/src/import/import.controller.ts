import { Body, Controller, Post, InternalServerErrorException } from "@nestjs/common";
import { ImportService } from "./import.service";
import { ImportLinkSchema } from "./dto/import-link.dto";

@Controller("jobs")
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post("import-link")
  async importLink(@Body() body: unknown) {
    const dto = ImportLinkSchema.parse(body);

    try {
      return await this.importService.importByLink(dto);
    } catch (err: any) {

      throw new InternalServerErrorException({
        message: "Failed to import job link",
        error: err?.message ?? String(err),
      });
    }
  }
}

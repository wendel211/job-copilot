import { Module } from "@nestjs/common";
import { ImportService } from "./import.service";
import { ImportController } from "./import.controller";

import { PrismaModule } from "../prisma/prisma.module";

import { GreenhouseScraper } from "./scrapers/greenhouse.scraper";
import { LeverScraper } from "./scrapers/lever.scraper";
import { WorkdayScraper } from "./scrapers/workday.scraper";
import { GupyScraper } from "./scrapers/gupy.scraper";
@Module({
  imports: [PrismaModule],
  controllers: [ImportController],
  providers: [
    ImportService,
    GreenhouseScraper,
    LeverScraper,
    WorkdayScraper,
    GupyScraper,
  ],
})
export class ImportModule {}

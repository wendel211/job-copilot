import { Module } from "@nestjs/common";
import { ImportService } from "./import.service";
import { CrawlerService } from "./crawler.service"; // <--- Importe aqui
import { ImportController } from "./import.controller";

import { PrismaModule } from "../../prisma/prisma.module";

import { GreenhouseScraper } from "./scrapers/greenhouse.scraper";
import { LeverScraper } from "./scrapers/lever.scraper";
import { WorkdayScraper } from "./scrapers/workday.scraper";
import { GupyScraper } from "./scrapers/gupy.scraper";
import { EventsModule } from "../events/events.module";

@Module({
  imports: [
    PrismaModule,
    EventsModule, 
  ],
  controllers: [ImportController],
  providers: [
    ImportService,
    CrawlerService, // <--- Adicione aos providers
    GreenhouseScraper,
    LeverScraper,
    WorkdayScraper,
    GupyScraper,
  ],
  exports: [
    ImportService,
    CrawlerService, 
  ]
})
export class ImportModule {}
import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";

import { ImportService } from "./import.service";
import { ImportController } from "./import.controller";
import { CrawlerService } from "./crawler.service";

import { PrismaModule } from "../../prisma/prisma.module";
import { EventsModule } from "../events/events.module";
import { CreditsModule } from "../credits/credits.module";

// Scrapers de ATS
import { GreenhouseScraper } from "./scrapers/greenhouse.scraper";
import { LeverScraper } from "./scrapers/lever.scraper";
import { WorkdayScraper } from "./scrapers/workday.scraper";
import { GupyScraper } from "./scrapers/gupy.scraper";
import { GenericScraper } from "./scrapers/generic.scraper";

// Fontes de Vagas
import { AdzunaService } from "./sources/adzuna.service";
import { ProgramathorService } from "./sources/programathor.service";
import { RemotiveService } from "./sources/remotive.service";

@Module({
  imports: [
    PrismaModule,
    EventsModule,
    CreditsModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [ImportController],
  providers: [
    ImportService,
    CrawlerService,

    // Scrapers ATS
    GreenhouseScraper,
    LeverScraper,
    WorkdayScraper,
    GupyScraper,
    GenericScraper,

    // Novas Fontes de Vagas
    AdzunaService,
    ProgramathorService,
    RemotiveService,
  ],
  exports: [
    ImportService,
    CrawlerService,
  ]
})
export class ImportModule { }
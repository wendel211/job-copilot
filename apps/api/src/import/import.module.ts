import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule"; // <--- Necessário para os Cron Jobs

import { ImportService } from "./import.service";
import { ImportController } from "./import.controller";
import { CrawlerService } from "./crawler.service";

import { PrismaModule } from "../../prisma/prisma.module";
import { EventsModule } from "../events/events.module";

// Scrapers de ATS (Existentes)
import { GreenhouseScraper } from "./scrapers/greenhouse.scraper";
import { LeverScraper } from "./scrapers/lever.scraper";
import { WorkdayScraper } from "./scrapers/workday.scraper";
import { GupyScraper } from "./scrapers/gupy.scraper";

// Novas Fontes "Zero-Cost" (Adicionados)
import { AdzunaService } from "./sources/adzuna.service";
import { ProgramathorService } from "./sources/programathor.service";
import { RemotiveService } from "./sources/remotive.service";

@Module({
  imports: [
    PrismaModule,
    EventsModule,
    ScheduleModule.forRoot(), // <--- Ativa os decorators @Cron do CrawlerService
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
export class ImportModule {}
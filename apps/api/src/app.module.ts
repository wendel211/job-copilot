import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { HealthModule } from "./health/health.module";
import { JobsModule } from "./jobs/jobs.module";
import { AppConfigModule } from "./config/config.module";
import { ImportModule } from "./import/import.module";
import { TemplatesModule } from "./templates/templates.module";

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    HealthModule,
    JobsModule,
    ImportModule,
    TemplatesModule,
  ],    
})
export class AppModule {}
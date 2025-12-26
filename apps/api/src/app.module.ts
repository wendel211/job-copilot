import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthModule } from "./health/health.module";
import { JobsModule } from "./jobs/jobs.module";

@Module({
  imports: [PrismaModule, HealthModule, JobsModule],
})
export class AppModule {}

import { Module } from "@nestjs/common";

import { ConfigModule } from "./config/config.module";
import { PrismaModule } from "../prisma/prisma.module";

// Domínios
import { HealthModule } from "./health/health.module";
import { JobsModule } from "./jobs/jobs.module";
import { ImportModule } from "./import/import.module";
import { TemplatesModule } from "./templates/templates.module";
import { EmailModule } from "./email/email.module";
import { CreditsModule } from "./credits/credits.module";

// Pipeline / Events / Stats
import { PipelineModule } from "./pipeline/pipeline.module";
import { EventsModule } from "./events/events.module";
import { StatsModule } from "./stats/stats.module";
import { AuthModule } from "./auth/auth.module";

import { UsersModule } from "./users/users.module";
import { AiModule } from "./ai/ai.module";

@Module({
  imports: [

    ConfigModule,
    PrismaModule,

    // Base
    HealthModule,

    // Autenticação (Login/Registro)
    AuthModule,

    UsersModule,

    // Domínio
    JobsModule,
    ImportModule,
    TemplatesModule,
    EmailModule,
    CreditsModule, // Sistema de créditos

    // Funcionamento interno
    PipelineModule,
    EventsModule,

    // Dashboards
    StatsModule,

    // AI Scanner
    AiModule,
  ],
})
export class AppModule { }
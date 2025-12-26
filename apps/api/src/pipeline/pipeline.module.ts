import { Module } from "@nestjs/common";
import { PipelineService } from "./pipeline.service";
import { PipelineController } from "./pipeline.controller";
import { PrismaModule } from "../../prisma/prisma.module";
import { EventsModule } from "../events/events.module";

@Module({
  imports: [PrismaModule, EventsModule],
  controllers: [PipelineController],
  providers: [PipelineService],
})
export class PipelineModule {}

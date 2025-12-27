import { Module } from "@nestjs/common";
import { PrismaModule } from "../../../prisma/prisma.module";
import { EmailSendController } from "./email-send.controller";
import { EmailSendService } from "./email-send.service";
import { EmailProviderModule } from "../provider/email-provider.module";
import { EventsModule } from "../../events/events.module";
import { PipelineModule } from "../../pipeline/pipeline.module";

@Module({
  imports: [
    PrismaModule,
    EmailProviderModule,
    EventsModule,
    PipelineModule,
  ],
  controllers: [EmailSendController],
  providers: [EmailSendService],
  exports: [EmailSendService],
})
export class EmailSendModule {}

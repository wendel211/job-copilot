import { Module } from "@nestjs/common";
import { PrismaModule } from "../../../prisma/prisma.module";
import { EmailDraftController } from "./email-draft.controller";
import { EmailDraftService } from "./email-draft.service";
import { EventsModule } from "../../events/events.module";

@Module({
  imports: [PrismaModule, EventsModule],
  controllers: [EmailDraftController],
  providers: [EmailDraftService],
  exports: [EmailDraftService],
})
export class EmailDraftModule {}

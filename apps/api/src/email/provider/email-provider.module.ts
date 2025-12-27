import { Module } from "@nestjs/common";
import { PrismaModule } from "../../../prisma/prisma.module";
import { EmailProviderService } from "./email-provider.service";
import { EmailProviderController } from "./email-provider.controller";
import { EventsModule } from "../../events/events.module";

@Module({
  imports: [PrismaModule, EventsModule],
  controllers: [EmailProviderController],
  providers: [EmailProviderService],
  exports: [EmailProviderService],
})
export class EmailProviderModule {}

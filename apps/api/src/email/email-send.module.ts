import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { EmailSendController } from "./email-send.controller";
import { EmailSendService } from "./email-send.service";

@Module({
  imports: [PrismaModule],
  controllers: [EmailSendController],
  providers: [EmailSendService],
})
export class EmailSendModule {}

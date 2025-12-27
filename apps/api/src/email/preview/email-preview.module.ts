import { Module } from "@nestjs/common";
import { PrismaModule } from "../../../prisma/prisma.module";
import { EmailPreviewController } from "./email-preview.controller";
import { EmailPreviewService } from "./email-preview.service";

@Module({
  imports: [PrismaModule],
  controllers: [EmailPreviewController],
  providers: [EmailPreviewService],
  exports: [EmailPreviewService],
})
export class EmailPreviewModule {}

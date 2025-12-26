import { Module } from "@nestjs/common";
import { PrismaModule } from "../../../prisma/prisma.module";
import { EmailProviderController } from "./email-provider.controller";
import { EmailProviderService } from "./email-provider.service";

@Module({
  imports: [PrismaModule],
  controllers: [EmailProviderController],
  providers: [EmailProviderService],
  exports: [EmailProviderService],
})
export class EmailProviderModule {}

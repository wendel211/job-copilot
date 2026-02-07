import { Module } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { CreditsController } from './credits.controller';
import { WebhooksController } from './webhooks.controller';
import { AbacatePayService } from './abacatepay.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [CreditsController, WebhooksController],
    providers: [CreditsService, AbacatePayService],
    exports: [CreditsService],
})
export class CreditsModule { }

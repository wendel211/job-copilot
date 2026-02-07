import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { JobsModule } from '../jobs/jobs.module';
import { UsersModule } from '../users/users.module'; // Importante para ter acesso ao ResumeParserService se ele for exportado

@Module({
    imports: [PrismaModule, JobsModule, UsersModule],
    controllers: [AiController],
    providers: [AiService],
})
export class AiModule { }

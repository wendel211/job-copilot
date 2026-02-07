import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { ResumeParserService } from './resume-parser.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, ResumeParserService],
  exports: [UsersService, ResumeParserService],
})
export class UsersModule { }
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
// ... outros imports

@Module({
  imports: [], // ...
  controllers: [AuthController, /* ...outros */],
  providers: [AuthService, PrismaService, /* ...outros */],
})
export class AppModule {}
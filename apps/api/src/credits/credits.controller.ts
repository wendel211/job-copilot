import { Controller, Get, Post, Body, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Credits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('credits')
export class CreditsController {
    constructor(private readonly creditsService: CreditsService) { }

    // GET /credits - Retorna créditos do usuário
    @Get()
    async getCredits(@Req() req: any) {
        const userId = req.user?.id;
        if (!userId) {
            throw new BadRequestException('Usuário não autenticado');
        }
        return this.creditsService.getCredits(userId);
    }

    // POST /credits/purchase - Cria cobrança PIX para comprar créditos
    @Post('purchase')
    async createPurchase(
        @Req() req: any,
        @Body() body: { quantity?: number }
    ) {
        const userId = req.user?.id;
        if (!userId) {
            throw new BadRequestException('Usuário não autenticado');
        }
        const quantity = body.quantity || 1;
        return this.creditsService.createPurchase(userId, quantity);
    }
}

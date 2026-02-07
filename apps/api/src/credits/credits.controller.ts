import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
        return this.creditsService.getCredits(req.user.sub);
    }

    // POST /credits/purchase - Cria cobrança PIX para comprar créditos
    @Post('purchase')
    async createPurchase(
        @Req() req: any,
        @Body() body: { quantity?: number }
    ) {
        const quantity = body.quantity || 1;
        return this.creditsService.createPurchase(req.user.sub, quantity);
    }
}

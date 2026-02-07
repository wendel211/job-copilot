import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('match')
    async match(@Body() body: { userId: string; jobId: string }) {
        return this.aiService.analyzeMatch(body.userId, body.jobId);
    }
}

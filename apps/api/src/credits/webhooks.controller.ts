import { Controller, Post, Body, Headers, Logger } from '@nestjs/common';
import { CreditsService } from './credits.service';

/**
 * Controller para receber webhooks do AbacatePay
 * URL: POST /webhooks/abacatepay
 */
@Controller('webhooks')
export class WebhooksController {
    private readonly logger = new Logger(WebhooksController.name);

    constructor(private readonly creditsService: CreditsService) { }

    @Post('abacatepay')
    async handleAbacatePayWebhook(
        @Body() body: any,
        @Headers('x-abacatepay-signature') signature: string
    ) {
        this.logger.log('Webhook AbacatePay recebido:', JSON.stringify(body));

        // TODO: Validar assinatura do webhook (segurança)
        // const isValid = this.validateSignature(body, signature);

        // Processar evento de pagamento confirmado
        if (body.event === 'billing.paid' && body.data?.id) {
            await this.creditsService.confirmPayment(body.data.id);
        }

        return { received: true };
    }
}

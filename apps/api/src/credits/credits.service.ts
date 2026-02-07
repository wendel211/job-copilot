import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AbacatePayService } from './abacatepay.service';

const CREDIT_PRICE_CENTS = 500; // R$5 por crédito

@Injectable()
export class CreditsService {
    private readonly logger = new Logger(CreditsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly abacatePay: AbacatePayService,
    ) { }

    // Retorna créditos do usuário
    async getCredits(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { importCredits: true },
        });
        return { credits: user?.importCredits || 0 };
    }

    // Verifica se tem créditos disponíveis
    async hasCredits(userId: string): Promise<boolean> {
        const { credits } = await this.getCredits(userId);
        return credits > 0;
    }

    // Consome 1 crédito (chamado após importação bem-sucedida)
    async useCredit(userId: string): Promise<void> {
        const { credits } = await this.getCredits(userId);

        if (credits <= 0) {
            throw new BadRequestException('Sem créditos disponíveis. Compre mais para continuar.');
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: { importCredits: { decrement: 1 } },
        });

        this.logger.log(`Crédito consumido. Usuário ${userId} agora tem ${credits - 1} créditos.`);
    }

    // Cria PIX QR Code para comprar créditos
    async createPurchase(userId: string, quantity: number = 1) {
        const amountCents = quantity * CREDIT_PRICE_CENTS;

        // Criar registro de compra pendente
        const purchase = await this.prisma.creditPurchase.create({
            data: {
                userId,
                credits: quantity,
                amountCents,
                status: 'pending',
            },
        });

        // Criar PIX QR Code no AbacatePay
        const pix = await this.abacatePay.createPixQrCode({
            amount: amountCents,
            description: `${quantity} credito(s) JobCopilot`,
        });

        if (!pix) {
            await this.prisma.creditPurchase.update({
                where: { id: purchase.id },
                data: { status: 'failed' },
            });
            throw new BadRequestException('Erro ao criar PIX. Tente novamente.');
        }

        // Atualizar com dados do PIX
        await this.prisma.creditPurchase.update({
            where: { id: purchase.id },
            data: {
                abacateId: pix.id,
                pixCode: pix.brCode,
                pixQrCode: pix.brCodeBase64,
            },
        });

        return {
            purchaseId: purchase.id,
            pixCode: pix.brCode,
            pixQrCode: pix.brCodeBase64,
            paymentUrl: '',
            amount: amountCents / 100,
            credits: quantity,
        };
    }

    // Processa webhook de pagamento confirmado
    async confirmPayment(abacateId: string) {
        const purchase = await this.prisma.creditPurchase.findFirst({
            where: { abacateId, status: 'pending' },
        });

        if (!purchase) {
            this.logger.warn(`Compra não encontrada para abacateId: ${abacateId}`);
            return false;
        }

        // Marcar como completa e adicionar créditos
        await this.prisma.$transaction([
            this.prisma.creditPurchase.update({
                where: { id: purchase.id },
                data: { status: 'completed' },
            }),
            this.prisma.user.update({
                where: { id: purchase.userId },
                data: { importCredits: { increment: purchase.credits } },
            }),
        ]);

        this.logger.log(`Pagamento confirmado! ${purchase.credits} créditos adicionados ao usuário ${purchase.userId}`);
        return true;
    }
}

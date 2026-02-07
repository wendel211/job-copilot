import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

interface BillingCreateResponse {
    id: string;
    url: string;
    qrCode: string;
    brCode: string; // Código PIX copia-e-cola
    status: string;
}

/**
 * Integração direta com API do AbacatePay
 * Docs: https://docs.abacatepay.com
 */
@Injectable()
export class AbacatePayService {
    private readonly logger = new Logger(AbacatePayService.name);
    private readonly apiUrl = 'https://api.abacatepay.com/v1';
    private readonly apiKey = process.env.ABACATEPAY_API_KEY;

    async createPixBilling(params: {
        amount: number; // Em centavos (500 = R$5)
        description: string;
        externalId: string; // ID interno para webhook
    }): Promise<BillingCreateResponse | null> {
        if (!this.apiKey) {
            this.logger.error('ABACATEPAY_API_KEY não configurada');
            return null;
        }

        try {
            const { data } = await axios.post(
                `${this.apiUrl}/billing/create`,
                {
                    amount: params.amount,
                    description: params.description,
                    externalReference: params.externalId,
                    methods: ['PIX'],
                    expiresIn: 3600, // 1 hora
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            this.logger.log(`Cobrança PIX criada: ${data.id}`);

            return {
                id: data.id,
                url: data.url,
                qrCode: data.pix?.qrCode || '',
                brCode: data.pix?.brCode || '',
                status: data.status,
            };
        } catch (error: any) {
            this.logger.error('Erro ao criar cobrança AbacatePay', error.response?.data || error.message);
            return null;
        }
    }

    // Verificar status de uma cobrança
    async getBillingStatus(billingId: string): Promise<string | null> {
        if (!this.apiKey) return null;

        try {
            const { data } = await axios.get(
                `${this.apiUrl}/billing/${billingId}`,
                {
                    headers: { 'Authorization': `Bearer ${this.apiKey}` },
                }
            );
            return data.status; // pending, paid, expired, cancelled
        } catch (error) {
            this.logger.error(`Erro ao consultar cobrança ${billingId}`);
            return null;
        }
    }
}

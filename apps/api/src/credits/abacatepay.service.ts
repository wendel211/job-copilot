import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

interface PixQrCodeResponse {
    id: string;
    brCode: string;      // Código PIX copia-e-cola
    brCodeBase64: string; // QR Code em base64
    status: string;
    amount: number;
}

/**
 * Integração direta com API do AbacatePay - PIX QR Code
 * Docs: https://docs.abacatepay.com
 */
@Injectable()
export class AbacatePayService {
    private readonly logger = new Logger(AbacatePayService.name);
    private readonly apiUrl = 'https://api.abacatepay.com/v1';
    private readonly apiKey = process.env.ABACATEPAY_API_KEY;

    async createPixQrCode(params: {
        amount: number;      // Em centavos (500 = R$5)
        description: string;
        expiresIn?: number;  // Tempo em segundos
    }): Promise<PixQrCodeResponse | null> {
        if (!this.apiKey) {
            this.logger.error('ABACATEPAY_API_KEY não configurada');
            return null;
        }

        try {
            const payload = {
                amount: params.amount,
                description: params.description.slice(0, 37), // Max 37 chars
                expiresIn: params.expiresIn || 3600, // 1 hora default
            };

            this.logger.log('Payload PIX QR Code:', JSON.stringify(payload, null, 2));

            const { data } = await axios.post(
                `${this.apiUrl}/pixQrCode/create`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            this.logger.log('Resposta PIX QR Code:', JSON.stringify(data, null, 2));

            // API retorna { data: {...}, error: null }
            const pix = data.data;

            return {
                id: pix?.id || '',
                brCode: pix?.brCode || '',
                brCodeBase64: pix?.brCodeBase64 || '',
                status: pix?.status || 'PENDING',
                amount: pix?.amount || params.amount,
            };
        } catch (error: any) {
            this.logger.error('Erro ao criar PIX QR Code', error.response?.data || error.message);
            return null;
        }
    }

    // Verificar status de um PIX QR Code
    async getPixStatus(pixId: string): Promise<string | null> {
        if (!this.apiKey) return null;

        try {
            const { data } = await axios.get(
                `${this.apiUrl}/pixQrCode/${pixId}`,
                {
                    headers: { 'Authorization': `Bearer ${this.apiKey}` },
                }
            );
            return data.data?.status; // PENDING, PAID, EXPIRED, CANCELLED
        } catch (error) {
            this.logger.error(`Erro ao consultar PIX ${pixId}`);
            return null;
        }
    }
}

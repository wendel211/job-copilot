import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import * as nodemailer from "nodemailer";
import { encryption } from "../../common/encryption";

@Injectable()
export class EmailProviderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) {
    // Garante que existe senha antes de criptografar (ou usa string vazia se for null)
    const passToEncrypt = dto.smtpPass || ''; 
    const encryptedPass = encryption.encrypt(passToEncrypt);

    return this.prisma.$transaction(async (tx) => {
      // Desativa anteriores
      await tx.emailProvider.updateMany({
        where: { userId: dto.userId },
        data: { isActive: false },
      });

      // Cria novo
      return tx.emailProvider.create({
        data: {
          userId: dto.userId,
          type: dto.type || 'smtp',
          isActive: true,
          smtpHost: dto.smtpHost,
          smtpPort: dto.smtpPort ? Number(dto.smtpPort) : 587,
          smtpSecure: dto.smtpSecure ?? true,
          smtpUser: dto.smtpUser,
          smtpPassEnc: encryptedPass,
          fromEmail: dto.fromEmail,
          fromName: dto.fromName,
        },
      });
    });
  }

  async list(userId: string) {
    const providers = await this.prisma.emailProvider.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return {
      providers: providers.map(p => ({
        ...p,
        smtpPassEnc: undefined // Segurança: remove a senha do retorno
      }))
    };
  }

  async update(id: string, dto: any) {
    const provider = await this.prisma.emailProvider.findUnique({ where: { id } });
    if (!provider) throw new NotFoundException("Provider not found");

    const dataToUpdate: any = { ...dto };
    
    if (dto.smtpPass) {
      dataToUpdate.smtpPassEnc = encryption.encrypt(dto.smtpPass);
      delete dataToUpdate.smtpPass;
    }

    if (dto.isActive === true) {
      await this.prisma.emailProvider.updateMany({
        where: { userId: provider.userId, id: { not: id } },
        data: { isActive: false }
      });
    }

    return this.prisma.emailProvider.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async test(id: string) {
    const provider = await this.prisma.emailProvider.findUnique({ where: { id } });
    if (!provider) throw new NotFoundException("Provider not found");

    // CORREÇÃO DO ERRO AQUI:
    // Verificamos se smtpPassEnc existe antes de descriptografar.
    if (!provider.smtpPassEnc) {
        return { ok: false, error: "Senha SMTP não configurada neste provedor." };
    }

    const password = encryption.decrypt(provider.smtpPassEnc);

    const transporter = nodemailer.createTransport({
      host: provider.smtpHost,
      port: provider.smtpPort,
      secure: provider.smtpSecure,
      auth: {
        user: provider.smtpUser,
        pass: password,
      },
    });

    try {
      await transporter.verify();
      return { ok: true };
    } catch (error) {
      console.error("SMTP Error:", error);
      return { ok: false, error: error.message };
    }
  }

  async getActiveProvider(userId: string) {
    const provider = await this.prisma.emailProvider.findFirst({
      where: { userId, isActive: true },
    });
    
    // CORREÇÃO DO ERRO AQUI TAMBÉM:
    if (provider && provider.smtpPassEnc) {
        provider.smtpPassEnc = encryption.decrypt(provider.smtpPassEnc);
    }
    
    return provider;
  }
}
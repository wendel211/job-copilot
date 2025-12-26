import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import nodemailer from "nodemailer";

@Injectable()
export class EmailProviderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto) {
    const provider = await this.prisma.emailProviderConfig.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        isActive: true,
        smtpHost: dto.smtpHost,
        smtpPort: dto.smtpPort,
        smtpSecure: dto.smtpSecure,
        smtpUser: dto.smtpUser,
        smtpPassEnc: dto.smtpPass, // FUTURO: criptografia
        fromEmail: dto.fromEmail,
        fromName: dto.fromName,
      },
    });

    return { provider };
  }

  async list(userId: string) {
    return {
      providers: await this.prisma.emailProviderConfig.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
    };
  }

  async update(id: string, dto) {
    const exists = await this.prisma.emailProviderConfig.findUnique({
      where: { id },
    });
    if (!exists) throw new NotFoundException("Provider not found");

    const provider = await this.prisma.emailProviderConfig.update({
      where: { id },
      data: { ...dto },
    });

    return { provider };
  }

  async test(id: string) {
    const provider = await this.prisma.emailProviderConfig.findUnique({
      where: { id },
    });
    if (!provider) throw new NotFoundException("Provider not found");

    const transporter = nodemailer.createTransport({
      host: provider.smtpHost,
      port: provider.smtpPort,
      secure: provider.smtpSecure,
      auth: {
        user: provider.smtpUser,
        pass: provider.smtpPassEnc,
      },
    });

    await transporter.verify();

    return { ok: true };
  }

  async getActiveProvider(userId: string) {
    return this.prisma.emailProviderConfig.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: "desc" },
    });
  }
}

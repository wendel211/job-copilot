import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ResumeParserService } from './resume-parser.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private resumeParser: ResumeParserService
  ) { }

  // 1. Buscar Perfil (sem senha)
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        headline: true,
        bio: true,
        skills: true,
        linkedinUrl: true,
        resumeUrl: true,
        jobPreferences: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  // 2. Atualizar Perfil
  async updateProfile(userId: string, data: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        // Garante que jobPreferences seja salvo corretamente se enviado
        jobPreferences: data.jobPreferences ? data.jobPreferences : undefined,
      },
      select: { id: true, email: true, fullName: true, updatedAt: true }
    });
  }

  // 3. Salvar Caminho do Currículo e Executar Parser
  async updateResume(userId: string, filePath: string) {
    // 1. Atualizar URL do arquivo
    await this.prisma.user.update({
      where: { id: userId },
      data: { resumeUrl: filePath },
    });

    // 2. Tentar extrair dados do currículo
    try {
      const extractedData = await this.resumeParser.parseResume(filePath);
      this.logger.log(`Extracted: skills=${extractedData.skills.length}, headline=${!!extractedData.headline}`);


      // Só atualiza se encontrar algo e se o campo estiver vazio ou se quisermos dar merge
      // Estratégia: Adicionar skills novas e preencher Headline/Bio se vazios

      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { skills: true, headline: true, bio: true } });

      if (!user) return; // Should not happen

      const updates: any = {};

      // Merge Skills (Uniq)
      if (extractedData.skills.length > 0) {
        const currentSkills = new Set(user.skills || []);
        extractedData.skills.forEach(s => currentSkills.add(s));
        updates.skills = Array.from(currentSkills);
      }

      // Fill Headline - OVERWRITE (User wants latest resume info)
      if (extractedData.headline) {
        updates.headline = extractedData.headline;
      }

      // Fill Bio - OVERWRITE
      if (extractedData.bio) {
        updates.bio = extractedData.bio;
      }

      if (Object.keys(updates).length > 0) {
        await this.prisma.user.update({
          where: { id: userId },
          data: updates
        });
        this.logger.log(`Updated profile for user ${userId} with extracted resume data.`);
      }

    } catch (e) {
      this.logger.error(`Failed to parse resume for user ${userId}`, e);
      // Não falha a request, apenas loga
    }
  }
}
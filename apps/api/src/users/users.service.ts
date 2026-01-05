import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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

  // 3. Salvar Caminho do Currículo
  async updateResume(userId: string, filePath: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { resumeUrl: filePath },
    });
  }
}
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        fullName: dto.fullName || 'Usuário',
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async login(dto: LoginDto) {
    console.log(`🔐 Tentativa de login: ${dto.email}`);

    // 1. Busca o usuário pelo email
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    
    if (!user) {
        console.log('❌ Usuário não encontrado no banco.');
        throw new UnauthorizedException('Credenciais inválidas');
    }

    // 2. Compara a senha enviada (123456) com o hash do banco
    // AQUI É O PULO DO GATO: Tem que usar bcrypt.compare
    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
        console.log('❌ Senha incorreta.');
        // Dica de Debug: Mostra o que está sendo comparado (Cuidado em produção!)
        // console.log('Enviada:', dto.password); 
        // console.log('Banco:', user.password);
        throw new UnauthorizedException('Credenciais inválidas');
    }

    console.log('✅ Login autorizado!');

    // 3. Retorna os dados (sem a senha)
    const { password, ...result } = user;
    return result;
  }
}
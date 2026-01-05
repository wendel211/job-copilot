import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt'; // <--- Importar

@Injectable()
export class AuthService {
  // Injetar o JwtService
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService 
  ) {}

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

    // Já loga o usuário direto ao registrar (gera token)
    return this.login(dto); 
  }

  async login(dto: LoginDto) {
    console.log(`🔐 Tentativa de login: ${dto.email}`);

    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) throw new UnauthorizedException('Credenciais inválidas');

    console.log('✅ Login autorizado! Gerando token...');

    // 4. CRIAR O PAYLOAD (DADOS QUE VÃO DENTRO DO TOKEN)
    const payload = { email: user.email, sub: user.id };

    // 5. RETORNAR O TOKEN + DADOS DO USUÁRIO
    const { password, ...userData } = user;
    
    return {
      access_token: this.jwtService.sign(payload), // <--- O TOKEN MÁGICO
      user: userData
    };
  }
}
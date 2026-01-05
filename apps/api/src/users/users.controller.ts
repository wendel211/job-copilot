import { 
  Controller, 
  Get, 
  Patch, 
  Post, 
  Body, 
  Req, 
  UseGuards, // <--- Importante
  UseInterceptors, 
  UploadedFile, 
  ParseFilePipe, 
  MaxFileSizeValidator, 
  FileTypeValidator 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

// 👇 Ajuste o caminho conforme a estrutura da sua pasta auth. 
// Geralmente fica em ../auth/jwt-auth.guard ou ../auth/guards/jwt-auth.guard
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth() // 🔐 Adiciona o cadeado no Swagger
@UseGuards(JwtAuthGuard) // 🛡️ Protege TODAS as rotas deste controller
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // =================================================================
  // 1. OBTER PERFIL
  // =================================================================
  @Get('profile')
  @ApiOperation({ summary: 'Obter perfil do usuário logado' })
  async getProfile(@Req() req: any) {
    // O Guard (JwtAuthGuard) descriptografa o token e coloca o user no request
    const userId = req.user.id; 
    
    return this.usersService.getProfile(userId);
  }

  // =================================================================
  // 2. ATUALIZAR PERFIL
  // =================================================================
  @Patch('profile')
  @ApiOperation({ summary: 'Atualizar dados do perfil' })
  async updateProfile(@Req() req: any, @Body() body: any) {
    const userId = req.user.id;
    
    return this.usersService.updateProfile(userId, body);
  }

  // =================================================================
  // 3. UPLOAD DE CURRÍCULO
  // =================================================================
  @Post('resume')
  @ApiOperation({ summary: 'Upload de currículo PDF' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `resume-${uniqueSuffix}${ext}`);
      },
    }),
  }))
  async uploadResume(
    @Req() req: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
      }),
    ) file: Express.Multer.File,
  ) {
    const userId = req.user.id;
    
    await this.usersService.updateResume(userId, file.path);
    
    return { 
      message: 'Currículo enviado com sucesso', 
      filename: file.filename,
      path: file.path 
    };
  }
}
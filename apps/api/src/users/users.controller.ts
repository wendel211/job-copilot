import { 
  Controller, Get, Patch, Post, Body, Req, 
  UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
// REMOVA: import type { File } from 'multer'; <--- TIRA ISSO SE TIVER

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ... (outros métodos)

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
    @Req() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
      }),
    ) file: Express.Multer.File, // <--- A CORREÇÃO ESTÁ AQUI (Use Express.Multer.File)
  ) {
    const userId = req.user?.id || 'id-do-seu-usuario-no-banco-aqui';
    
    await this.usersService.updateResume(userId, file.path);
    
    return { 
      message: 'Currículo enviado com sucesso', 
      filename: file.filename,
      path: file.path 
    };
  }
}
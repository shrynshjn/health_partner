import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { UploadMediaResponseDto } from './dto/upload-media-response.dto';

@ApiTags('media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly service: MediaService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        type: { type: 'string', enum: ['food','workout','sleep','water','report'] },
        path: { type: 'string' }
      },
      required: ['file', 'type']
    }
  })
  @ApiOkResponse({ type: UploadMediaResponseDto })
  async upload(@CurrentUser() user: any, @UploadedFile() file: Express.Multer.File, @Body() dto: UploadMediaDto) {
    return this.service.upload(user.userId, file, dto.type, dto.path);
  }
}

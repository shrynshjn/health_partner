import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UploadMediaDto {
  @ApiProperty({ example: 'food', enum: ['food','workout','sleep','water','report'] })
  @IsIn(['food','workout','sleep','water','report'])
  type: 'food' | 'workout' | 'sleep' | 'water' | 'report';

  @ApiProperty({ required: false, example: 'extra/meta/path', description: 'Optional extra path segment' })
  @IsOptional()
  @IsString()
  path?: string;
}

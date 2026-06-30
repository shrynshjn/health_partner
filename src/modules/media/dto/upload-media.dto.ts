import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UploadMediaDto {
  @ApiProperty({ example: 'food', enum: ['food','workout','sleep','water','report','profile'] })
  @IsIn(['food','workout','sleep','water','report','profile'])
  type: 'food' | 'workout' | 'sleep' | 'water' | 'report' | 'profile';

  @ApiProperty({ required: false, example: 'extra/meta/path', description: 'Optional extra path segment' })
  @IsOptional()
  @IsString()
  path?: string;
}

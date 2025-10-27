import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UploadMediaDto {
  @ApiProperty({ required: false, example: 'extra/meta/path', description: 'Optional extra path segment' })
  @IsOptional()
  @IsString()
  path?: string;
}

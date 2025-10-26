import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreatePhysicalDto } from './create-physical.dto';

export class BulkPhysicalDto {
  @ApiProperty({ type: [CreatePhysicalDto], description: 'Multiple physical parameter items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePhysicalDto)
  items: CreatePhysicalDto[];

  @ApiPropertyOptional({ example: 'batch-key-123', description: 'Idempotency key for the whole batch' })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}

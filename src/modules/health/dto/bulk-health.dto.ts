import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateHealthDto } from './create-health.dto';

export class BulkHealthDto {
  @ApiProperty({ type: [CreateHealthDto], description: 'Multiple health parameters from a single report' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateHealthDto)
  items: CreateHealthDto[];

  @ApiPropertyOptional({ example: 'report-batch-uuid', description: 'Batch idempotency key' })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}

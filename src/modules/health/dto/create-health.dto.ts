import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateHealthDto {
  @ApiProperty({ example: 'vitaminD', description: 'Parameter name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 28.5, description: 'Measured value' })
  @IsNumber()
  value: number;

  @ApiProperty({ example: 20, description: 'Reference minimum' })
  @IsNumber()
  refMin: number;

  @ApiProperty({ example: 50, description: 'Reference maximum' })
  @IsNumber()
  refMax: number;

  @ApiProperty({ example: true, description: 'Whether value is within range' })
  @IsBoolean()
  isOkay: boolean;

  @ApiProperty({ example: '2025-01-20T07:00:00Z', description: 'Report timestamp (ISO)' })
  @IsDateString()
  reportTime: string;

  @ApiPropertyOptional({ example: 'https://cdn/reports/abc.pdf', description: 'Link to report PDF' })
  @IsOptional()
  @IsString()
  reportLink?: string;

  @ApiPropertyOptional({ example: 'ng/mL', description: 'Unit of measurement' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ example: 'vitamins', description: 'Medical category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'report-uuid', description: 'Idempotency key to prevent duplicates' })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}

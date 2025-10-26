import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class QueryPhysicalTrendsDto {
  @ApiProperty({ type: [String], example: ['weight','bodyFat'], description: 'Parameter types' })
  @IsArray()
  types: string[];

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  @IsDateString()
  start: string;

  @ApiProperty({ example: '2025-02-01T00:00:00Z' })
  @IsDateString()
  end: string;

  @ApiPropertyOptional({ example: 'day', description: 'Aggregation interval (day|week|month)' })
  @IsOptional()
  @IsString()
  interval?: 'day' | 'week' | 'month';
}

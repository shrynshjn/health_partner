import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class QueryHealthTrendsDto {
  @ApiProperty({ type: [String], example: ['vitaminD','hdl'], description: 'Parameter names' })
  @IsArray()
  names: string[];

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  @IsDateString()
  start: string;

  @ApiProperty({ example: '2025-02-01T00:00:00Z' })
  @IsDateString()
  end: string;

  @ApiPropertyOptional({ example: 'month', description: 'Aggregation interval (day|week|month)' })
  @IsOptional()
  @IsString()
  interval?: 'day'|'week'|'month';
}

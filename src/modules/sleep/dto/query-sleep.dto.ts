import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QuerySleepDto {
  @ApiProperty({ example: '2025-01-01T00:00:00Z', description: 'Start timestamp of range' })
  @IsDateString()
  start: string;

  @ApiProperty({ example: '2025-02-01T00:00:00Z', description: 'End timestamp of range' })
  @IsDateString()
  end: string;

  @ApiPropertyOptional({ example: 20, description: 'Number of sleep logs to fetch' })
  @IsOptional()
  @Type(() => Number) 
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ example: '67af1c823ffc...', description: 'Cursor for pagination' })
  @IsOptional()
  @IsString()
  cursor?: string;
}

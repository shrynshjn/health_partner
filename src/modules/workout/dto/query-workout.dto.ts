import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryWorkoutDto {
  @ApiProperty({ example: '2025-01-01T00:00:00Z', description: 'Start date/time of the range' })
  @IsDateString()
  start: string;

  @ApiProperty({ example: '2025-02-01T00:00:00Z', description: 'End date/time of the range' })
  @IsDateString()
  end: string;

  @ApiPropertyOptional({ example: 50, description: 'Max number of results, default 100' })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ example: '67ac58b2fd...', description: 'Pagination cursor for next page' })
  @IsOptional()
  @IsString()
  cursor?: string;
}

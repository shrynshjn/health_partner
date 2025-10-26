import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryWaterDto {
  @ApiProperty({ example: '2025-01-01T00:00:00Z', description: 'Start of time range (inclusive)' })
  @IsDateString()
  start: string;

  @ApiProperty({ example: '2025-01-31T23:59:59Z', description: 'End of time range (exclusive)' })
  @IsDateString()
  end: string;

  @ApiPropertyOptional({ example: 50, description: 'Max number of records to fetch' })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ example: '67af1c823ffc...', description: 'Cursor ID for pagination' })
  @IsOptional()
  @IsString()
  cursor?: string;
}

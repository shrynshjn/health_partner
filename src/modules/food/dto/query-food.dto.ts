import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryFoodDto {
  @ApiProperty({ example: '2025-01-20T00:00:00Z', description: 'Start timestamp (inclusive)' })
  @IsDateString()
  start: string;

  @ApiProperty({ example: '2025-01-27T00:00:00Z', description: 'End timestamp (exclusive)' })
  @IsDateString()
  end: string;

  @ApiProperty({ example: 50, required: false, description: 'Max number of results (default 100)' })
  @IsOptional()
  @Type(() => Number) 
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiProperty({ example: '67ac58b2fd...', required: false, description: 'Cursor for pagination' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ enum: ['breakfast','lunch','dinner','snack'] })
  @IsOptional() @IsString()
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

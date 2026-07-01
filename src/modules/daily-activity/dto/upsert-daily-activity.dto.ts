import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class UpsertDailyActivityDto {
  @ApiProperty({ example: '2026-06-26', description: 'Date in YYYY-MM-DD format' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 8423 })
  @IsNumber() @Min(0)
  steps: number;

  @ApiProperty({ example: 42 })
  @IsNumber() @Min(0)
  activeMinutes: number;

  @ApiProperty({ example: 6100 })
  @IsNumber() @Min(0)
  distanceMeters: number;

  @ApiPropertyOptional({ example: 320 })
  @IsOptional() @IsNumber() @Min(0)
  calories?: number;

  @ApiPropertyOptional({ example: { '09': 423, '10': 1205 } })
  @IsOptional() @IsObject()
  hourlySteps?: Record<string, number>;

  @ApiPropertyOptional({ example: { '09': 8, '10': 22 } })
  @IsOptional() @IsObject()
  hourlyActiveMinutes?: Record<string, number>;

  @ApiPropertyOptional({ example: { '09': 45, '10': 120 } })
  @IsOptional() @IsObject()
  hourlyCalories?: Record<string, number>;

  @ApiPropertyOptional({ example: 'apple_health' })
  @IsOptional() @IsString()
  source?: string;
}

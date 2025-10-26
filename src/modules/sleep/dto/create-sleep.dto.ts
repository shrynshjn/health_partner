import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateSleepDto {
  @ApiProperty({ example: '2025-01-25T22:30:00Z', description: 'Sleep start time (ISO)' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2025-01-26T06:30:00Z', description: 'Sleep end time (ISO)' })
  @IsDateString()
  endTime: string;

  @ApiProperty({ example: 28800000, description: 'Duration in ms (e.g., 8 hrs = 28800000)' })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiPropertyOptional({ example: 'fitbit', description: 'Source of data (ai | manual | fitbit | apple_health)' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ example: 'unique-sleep-key-123', description: 'Idempotency key to avoid duplicates' })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['https://cdn.sleepapp.com/reports/sleep1.png'],
    description: 'Screenshots or sleep tracking evidence',
  })
  @IsOptional()
  @IsArray()
  media?: string[];

  @ApiPropertyOptional({
    example: 'Slept from 10:30 PM to 6:30 AM with good deep sleep cycles',
    description: 'AI-generated summary of sleep',
  })
  @IsOptional()
  @IsString()
  naturalText?: string;
}

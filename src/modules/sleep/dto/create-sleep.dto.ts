import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

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

  @ApiPropertyOptional({ description: 'Core (light) sleep duration ms' })
  @IsOptional() @IsInt() coreSleepMs?: number;

  @ApiPropertyOptional({ description: 'Deep sleep duration ms' })
  @IsOptional() @IsInt() deepSleepMs?: number;

  @ApiPropertyOptional({ description: 'REM sleep duration ms' })
  @IsOptional() @IsInt() remSleepMs?: number;

  @ApiPropertyOptional({ description: 'Time awake during sleep ms' })
  @IsOptional() @IsInt() awakeDuringMs?: number;

  @ApiPropertyOptional({ description: 'Total time in bed ms' })
  @IsOptional() @IsInt() inBedMs?: number;

  @ApiPropertyOptional({ description: 'Sleep efficiency 0–100' })
  @IsOptional() @IsInt() @Min(0) sleepEfficiency?: number;

  @ApiPropertyOptional({ description: 'Source app name (AutoSleep, Sleep Cycle, etc.)' })
  @IsOptional() @IsString() sourceName?: string;

  @ApiPropertyOptional({ description: 'Average heart rate during sleep (bpm)' })
  @IsOptional() @IsInt() avgHeartRate?: number;

  @ApiPropertyOptional({ description: 'Min heart rate during sleep (bpm)' })
  @IsOptional() @IsInt() minHeartRate?: number;

  @ApiPropertyOptional({ description: 'Max heart rate during sleep (bpm)' })
  @IsOptional() @IsInt() maxHeartRate?: number;

  @ApiPropertyOptional({ description: 'Average HRV SDNN (ms)' })
  @IsOptional() @IsNumber() avgHRV?: number;

  @ApiPropertyOptional({ description: 'Average respiratory rate (breaths/min)' })
  @IsOptional() @IsNumber() avgRespiratoryRate?: number;

  @ApiPropertyOptional({ description: 'Average blood oxygen saturation (%)' })
  @IsOptional() @IsNumber() avgSpO2?: number;
}

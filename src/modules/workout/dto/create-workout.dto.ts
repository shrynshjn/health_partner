import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEnum, IsInt, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { WORKOUT_TYPES } from '../workout.schema';

export class CreateWorkoutDto {
  @ApiPropertyOptional({ example: 'Did a 5km run in the morning', description: 'Raw user input (optional)' })
  @IsOptional()
  @IsString()
  user_input?: string;

  @ApiProperty({ example: 'Morning Run', description: 'Name of the workout' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'running',
    description: 'Type of workout',
    enum: [...WORKOUT_TYPES],
  })
  @IsEnum([...WORKOUT_TYPES])
  type: string;

  @ApiProperty({ example: '2025-01-26T05:30:00Z', description: 'Workout start time (ISO format)' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: 3600000, description: 'Duration in milliseconds (e.g., 1 hour = 3600000)' })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiPropertyOptional({ example: '2025-01-26T06:30:00Z', description: 'Workout end time (can be auto-derived)' })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({ example: 450, description: 'Calories burned (if known)' })
  @IsNumber()
  calories: number;

  @ApiPropertyOptional({ example: 'outdoor', enum: ['indoor', 'outdoor', 'gym'], description: 'Workout location' })
  @IsOptional()
  @IsEnum(['indoor', 'outdoor', 'gym'])
  location?: string;

  @ApiPropertyOptional({ example: 'Felt amazing, great weather', description: 'Notes or description of workout' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'medium', enum: ['low', 'medium', 'high'], description: 'Workout intensity' })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  intensity?: string;

  @ApiPropertyOptional({ example: 145, description: 'Average heart rate during workout' })
  @IsOptional()
  @IsNumber()
  avgHeartRate?: number;

  @ApiPropertyOptional({ example: 5000, description: 'Distance covered in meters' })
  @IsOptional()
  @IsNumber()
  distanceMeters?: number;

  @ApiPropertyOptional({ example: 98, description: 'Minimum heart rate during workout' })
  @IsOptional()
  @IsNumber()
  minHeartRate?: number;

  @ApiPropertyOptional({ example: 178, description: 'Maximum heart rate during workout' })
  @IsOptional()
  @IsNumber()
  maxHeartRate?: number;

  @ApiPropertyOptional({ description: 'Platform-specific metadata, e.g. { appleHealth: { elevationAscendedMeters: 120 } }' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ example: 'ai', description: 'Source of data (ai, manual, import)' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ type: [String], example: ['https://cdn.com/run1.jpg'], description: 'Media URLs' })
  @IsOptional()
  @IsArray()
  media?: string[];

  @ApiPropertyOptional({ example: 'Ran for 5km at a moderate pace around the lake', description: 'AI-generated summary' })
  @IsOptional()
  @IsString()
  naturalText?: string;

  @ApiPropertyOptional({ example: 'unique-idempotency-key-123', description: 'Avoid duplicate workout log' })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}

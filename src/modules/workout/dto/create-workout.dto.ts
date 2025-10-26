import { IsArray, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateWorkoutDto {
  @IsOptional() @IsString() user_input?: string;
  @IsString() name: string;
  @IsEnum(['yoga','running','walking','cycling','gym']) type: 'yoga'|'running'|'walking'|'cycling'|'gym';
  @IsDateString() startTime: string;
  @IsInt() @Min(0) duration: number; // ms
  @IsOptional() @IsDateString() endTime?: string;
  @IsOptional() @IsNumber() calories?: number;
  @IsOptional() @IsEnum(['indoor','outdoor','gym']) location?: 'indoor'|'outdoor'|'gym';
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(['low','medium','high']) intensity?: 'low'|'medium'|'high';
  @IsOptional() @IsNumber() avgHeartRate?: number;
  @IsOptional() @IsString() source?: string;
  @IsOptional() @IsArray() media?: string[];
  @IsOptional() @IsString() naturalText?: string;
  @IsOptional() @IsString() idempotencyKey?: string;
}

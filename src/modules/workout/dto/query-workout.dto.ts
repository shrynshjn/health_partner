import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryWorkoutDto {
  @IsDateString() start: string;
  @IsDateString() end: string;
  @IsOptional() @IsInt() @Min(1) limit?: number;
  @IsOptional() @IsString() cursor?: string;
}

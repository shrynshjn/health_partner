import { IsArray, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() first_name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() last_name?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dob?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() gender?: string;
  @ApiPropertyOptional({ example: 'vegetarian', description: 'e.g. vegetarian, vegan, non-vegetarian, eggetarian, pescatarian' })
  @IsOptional() @IsString() dietPreference?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() photo_url?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() nicknames?: string[];
}

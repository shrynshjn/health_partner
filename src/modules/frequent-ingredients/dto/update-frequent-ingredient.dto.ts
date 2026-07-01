import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class UpdateFrequentIngredientDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) aliases?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() brand?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) calories?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) protein?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) carbs?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) fats?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) fibre?: number;

  @ApiPropertyOptional() @IsOptional() @IsObject() additionalNutritionData?: Record<string, number>;

  @ApiPropertyOptional() @IsOptional() @IsString() servingUnit?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() servingSize?: number;

  @ApiPropertyOptional({ description: 'Raw ingredient list from packaging' })
  @IsOptional() @IsArray() @IsString({ each: true }) ingredients?: string[];

  @ApiPropertyOptional() @IsOptional() @IsString() source?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

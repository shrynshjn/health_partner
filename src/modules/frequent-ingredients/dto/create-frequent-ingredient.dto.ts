import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class CreateFrequentIngredientDto {
  @ApiProperty({ example: 'Paneer' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: ['cottage cheese', 'chenna'] })
  @IsOptional() @IsArray() @IsString({ each: true })
  aliases?: string[];

  @ApiPropertyOptional({ example: 'Amul' })
  @IsOptional() @IsString()
  brand?: string;

  @ApiProperty({ example: 265 }) @IsNumber() @Min(0) calories: number;
  @ApiProperty({ example: 18 })  @IsNumber() @Min(0) protein: number;
  @ApiProperty({ example: 3 })   @IsNumber() @Min(0) carbs: number;
  @ApiProperty({ example: 20 })  @IsNumber() @Min(0) fats: number;

  @ApiPropertyOptional({ example: 0 }) @IsOptional() @IsNumber() @Min(0) fibre?: number;

  @ApiPropertyOptional({ example: { addedSugar: 0, saturatedFat: 13, transFat: 0, sodium: 30 } })
  @IsOptional() @IsObject()
  additionalNutritionData?: Record<string, number>;

  @ApiPropertyOptional({ example: '100g' }) @IsOptional() @IsString() servingUnit?: string;
  @ApiPropertyOptional({ example: 100 })    @IsOptional() @IsNumber() servingSize?: number;

  @ApiPropertyOptional({ example: ['water', 'sugar', 'modified starch', 'E202', 'E211'], description: 'Raw ingredient list from packaging for preservative/additive analysis' })
  @IsOptional() @IsArray() @IsString({ each: true })
  ingredients?: string[];

  @ApiPropertyOptional({ example: 'manual' }) @IsOptional() @IsString() source?: string;
  @ApiPropertyOptional({ example: 'Full-fat paneer, used in curries' }) @IsOptional() @IsString() notes?: string;
}

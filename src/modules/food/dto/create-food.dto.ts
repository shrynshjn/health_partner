import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFoodDto {
  @ApiPropertyOptional({ example: 'I had 2 rotis and dal', description: 'Raw input from the user' })
  @IsOptional()
  @IsString()
  user_input?: string;

  @ApiProperty({ example: 'Roti', description: 'Name of the food item' })
  @IsString()
  name: string;

  @ApiProperty({ example: 2, description: 'Quantity of the food item consumed' })
  @IsNumber()
  qty: number;

  @ApiProperty({ example: 'piece', description: 'Unit for quantity (g, ml, piece, bowl, etc.)' })
  @IsString()
  unit: string;

  @ApiPropertyOptional({ example: 'ai', description: 'Source of entry (ai, manual, camera)' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({ example: 250, description: 'Total calories of the food' })
  @IsNumber()
  calories: number;

  @ApiProperty({ example: 8, description: 'Protein in grams' })
  @IsNumber()
  protein: number;

  @ApiProperty({ example: 35, description: 'Carbohydrates in grams' })
  @IsNumber()
  carbs: number;

  @ApiProperty({ example: 5, description: 'Fats in grams' })
  @IsNumber()
  fats: number;

  @ApiPropertyOptional({ example: 2, description: 'Dietary fiber in grams' })
  @IsOptional()
  @IsNumber()
  fibre?: number;

  // Optional micronutrients
  @ApiPropertyOptional({ example: 120, description: 'Calcium in mg' })
  @IsOptional()
  @IsNumber()
  calcium?: number;

  @ApiPropertyOptional({ example: 2.5, description: 'Iron in mg' })
  @IsOptional()
  @IsNumber()
  iron?: number;

  @ApiPropertyOptional({ example: 1.2, description: 'Zinc in mg' })
  @IsOptional()
  @IsNumber()
  zinc?: number;

  @ApiPropertyOptional({ example: 25, description: 'Magnesium in mg' })
  @IsOptional()
  @IsNumber()
  magnesium?: number;

  @ApiPropertyOptional({ example: 15, description: 'Cholesterol (mg)' })
  @IsOptional()
  @IsNumber()
  cholesterol?: number;

  @ApiPropertyOptional({ example: 200, description: 'Sodium in mg' })
  @IsOptional()
  @IsNumber()
  sodium?: number;

  @ApiPropertyOptional({ example: 180, description: 'Potassium in mg' })
  @IsOptional()
  @IsNumber()
  potassium?: number;

  @ApiPropertyOptional({ example: 2.5, description: 'Vitamin D in μg' })
  @IsOptional()
  @IsNumber()
  vitaminD?: number;

  @ApiPropertyOptional({ example: 1.2, description: 'Vitamin B12 in μg' })
  @IsOptional()
  @IsNumber()
  vitaminB12?: number;

  @ApiPropertyOptional({ example: 450, description: 'Omega 3 fatty acids in mg' })
  @IsOptional()
  @IsNumber()
  omega3?: number;

  @ApiProperty({ example: '2025-01-26T08:30:00Z', description: 'Time of consumption' })
  @IsDateString()
  eatTime: string;

  @ApiPropertyOptional({ example: 'breakfast', enum: ['breakfast', 'lunch', 'dinner', 'snack'] })
  @IsOptional()
  @IsEnum(['breakfast', 'lunch', 'dinner', 'snack'])
  mealType?: string;

  @ApiPropertyOptional({ example: 'random-uuid', description: 'Idempotency key to prevent duplicate entries' })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @ApiPropertyOptional({ example: ['https://cdn.com/img.jpg'], description: 'Food images or media URLs' })
  @IsOptional()
  @IsArray()
  media?: string[];

  @ApiPropertyOptional({ example: '2 Rotis and one bowl of dal eaten for breakfast' })
  @IsOptional()
  @IsString()
  naturalText?: string;
}

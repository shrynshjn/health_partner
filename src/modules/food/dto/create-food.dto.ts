import { IsArray, IsDateString, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateFoodDto {
  @IsOptional() @IsString() user_input?: string;
  @IsString() name: string;
  @IsNumber() @Min(0) qty: number;
  @IsString() unit: string;
  @IsNumber() calories: number;
  @IsNumber() protein: number;
  @IsNumber() carbs: number;
  @IsNumber() fats: number;
  @IsDateString() eatTime: string;

  @IsOptional() @IsNumber() fibre?: number;
  @IsOptional() @IsNumber() calcium?: number;
  @IsOptional() @IsNumber() iron?: number;
  @IsOptional() @IsNumber() zinc?: number;
  @IsOptional() @IsNumber() magnesium?: number;
  @IsOptional() @IsNumber() cholesterol?: number;
  @IsOptional() @IsNumber() sodium?: number;
  @IsOptional() @IsNumber() potassium?: number;
  @IsOptional() @IsNumber() vitaminD?: number;
  @IsOptional() @IsNumber() vitaminB12?: number;
  @IsOptional() @IsNumber() omega3?: number;

  @IsOptional() @IsString() source?: string;
  @IsOptional() @IsIn(['breakfast','lunch','dinner','snack']) mealType?: string;
  @IsOptional() @IsArray() media?: string[];
  @IsOptional() @IsString() naturalText?: string;
  @IsOptional() @IsString() idempotencyKey?: string;
}

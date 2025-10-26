import { IsDateString, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryFoodDto {
  @IsDateString() start: string;
  @IsDateString() end: string;
  @IsOptional() @IsIn(['breakfast','lunch','dinner','snack']) mealType?: string;
  @IsOptional() @IsInt() @Min(1) limit?: number;
  @IsOptional() @IsString() cursor?: string;
}

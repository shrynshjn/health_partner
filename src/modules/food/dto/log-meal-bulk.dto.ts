import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateFoodDto } from './create-food.dto';

export class LogMealBulkDto {
  @ApiProperty({
    type: [CreateFoodDto],
    description: 'Array of food items to log together as a meal',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFoodDto)
  items: CreateFoodDto[];

  @ApiPropertyOptional({
    example: 'meal-uuid-key',
    description: 'Optional idempotency key to prevent duplicate bulk log',
  })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}

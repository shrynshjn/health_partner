import { ApiProperty } from '@nestjs/swagger';

export class GoalCatalogEntryDto {
  @ApiProperty({ example: 'calories', description: 'Parameter key' })
  parameter: string;

  @ApiProperty({ example: 'Daily Calories' })
  label: string;

  @ApiProperty({ example: '🍽️' })
  emoji: string;

  @ApiProperty({ example: 'kcal' })
  unit: string;

  @ApiProperty({ example: 2000 })
  defaultTarget: number;

  @ApiProperty({ example: 'max', enum: ['min', 'max', 'target'] })
  defaultType: 'min' | 'max' | 'target';
}

export class GetGoalCatalogResponseDto {
  @ApiProperty({ type: [GoalCatalogEntryDto] })
  goals: GoalCatalogEntryDto[];
}

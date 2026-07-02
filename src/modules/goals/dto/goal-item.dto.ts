import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsString } from 'class-validator';
import { GOAL_PARAM_KEYS } from '../goal-catalog';

export class GoalItemDto {
  @ApiProperty({ example: 'calories', description: 'Parameter key', enum: GOAL_PARAM_KEYS })
  @IsIn(GOAL_PARAM_KEYS)
  parameter: string;

  @ApiProperty({ example: 2000, description: 'Target value' })
  @IsNumber()
  target: number;

  @ApiProperty({ example: 'max', enum: ['min', 'max', 'target'] })
  @IsIn(['min', 'max', 'target'])
  type: 'min' | 'max' | 'target';

  @ApiProperty({ example: 'kcal', description: 'Unit' })
  @IsString()
  unit: string;
}

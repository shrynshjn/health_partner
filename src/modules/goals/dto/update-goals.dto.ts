import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { GoalItemDto } from './goal-item.dto';

export class UpdateGoalsDto {
  @ApiProperty({ type: [GoalItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoalItemDto)
  goals: GoalItemDto[];

  @ApiPropertyOptional({ example: 'goals-upd-123', description: 'Idempotency key (optional)' })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}

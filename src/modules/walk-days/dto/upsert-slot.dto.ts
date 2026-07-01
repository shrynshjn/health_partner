import { IsEnum, IsIn, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertSlotDto {
  @ApiProperty({ enum: ['completed', 'expired'] })
  @IsEnum(['completed', 'expired'])
  status: 'completed' | 'expired';

  @ApiPropertyOptional({ enum: ['manual', 'healthkit'] })
  @IsOptional()
  @IsIn(['manual', 'healthkit'])
  completionSource?: 'manual' | 'healthkit';

  @ApiPropertyOptional({ enum: ['steps', 'active_minutes'] })
  @IsOptional()
  @IsIn(['steps', 'active_minutes'])
  completionReason?: 'steps' | 'active_minutes';

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  steps?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  activeMinutes?: number;
}

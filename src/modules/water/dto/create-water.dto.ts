import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateWaterDto {
  @ApiProperty({ example: 300, description: 'Amount of water consumed in ml' })
  @IsInt()
  @Min(1)
  qty: number;

  @ApiProperty({
    example: '2025-01-26T09:15:00Z',
    description: 'Time when water was consumed (ISO8601 format)',
  })
  @IsDateString()
  drankAt: string;

  @ApiPropertyOptional({
    example: 'ai',
    description: 'Source of data (ai | manual | smart_device)',
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({
    example: 'unique-idempotency-key-123',
    description: 'Key to prevent duplicate logging',
  })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['https://cdn.healthapp.com/media/water.png'],
    description: 'Images / evidence of water intake',
  })
  @IsOptional()
  @IsArray()
  media?: string[];

  @ApiPropertyOptional({
    example: 'Drank a 300ml glass of water after workout',
    description: 'AI-generated natural language description',
  })
  @IsOptional()
  @IsString()
  naturalText?: string;
}

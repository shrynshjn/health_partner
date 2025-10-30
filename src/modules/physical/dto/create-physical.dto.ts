import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class CreatePhysicalDto {
  @ApiProperty({
    enum: [
      "weight",
      "height",
      "bodyFat",
      "waist",
      "hip",
      "quads",
      "chest",
      "biceps",
      "calves",
      "muscleMass",
      "bmi",
      "bmr",
      "boneMass",
      "metabolicAge",
      "skeletalMuscle",
      "subcutaneousFat",
      "visceralFat",
    ],
    example: "weight",
    description: "Type of physical parameter",
  })
  @IsEnum([
    "weight",
    "height",
    "bodyFat",
    "waist",
    "hip",
    "quads",
    "chest",
    "biceps",
    "calves",
    "muscleMass",
    "bmi",
    "bmr",
    "boneMass",
    "metabolicAge",
    "skeletalMuscle",
    "subcutaneousFat",
    "visceralFat",
  ])
  type: string;

  @ApiProperty({ example: 72.4, description: "Measured value" })
  @IsNumber()
  value: number;

  @ApiProperty({
    example: "2025-01-26T07:30:00Z",
    description: "Measurement timestamp (ISO8601)",
  })
  @IsDateString()
  measuredAt: string;

  @ApiPropertyOptional({
    example: "smart_scale",
    description: "Source of data (manual | smart_scale | other)",
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({
    example: "unique-idempotency-key",
    description: "Key to prevent duplicate logs",
  })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ["https://cdn/img.jpg"],
    description: "Evidence images",
  })
  @IsOptional()
  @IsArray()
  media?: string[];
}

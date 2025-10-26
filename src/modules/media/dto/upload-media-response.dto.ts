import { ApiProperty } from '@nestjs/swagger';

export class UploadMediaResponseDto {
  @ApiProperty({ example: 'https://bucket.s3.amazonaws.com/user123/food/abc.jpg' })
  url: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType: string;

  @ApiProperty({ example: 34567, description: 'File size in bytes' })
  size: number;

  @ApiProperty({ example: 'user123/food/2025-10-26_101010_abc.jpg', description: 'Storage key' })
  key: string;
}

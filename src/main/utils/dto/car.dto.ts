import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export class CreateCarDto {
  @ApiProperty({
    example: 1,
  })
  categoryId: number;

  @ApiProperty({
    example: 1,
  })
  brandId: number;

  @ApiProperty({
    example: 1,
  })
  modelId: number;
  @ApiProperty({
    example: 2001,
  })
  year: number;

  @ApiProperty({
    example: {},
  })
  specifications: string;

  @ApiProperty({
    example: 200000.5,
  })
  basePrice: number;
}

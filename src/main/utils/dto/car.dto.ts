import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

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

export class UploadCarPicturesDto {
  @IsNotEmpty()
  carId: string;
}
export class UploadCategoryDto {
  id: number; // ID ของหมวดหมู่

  logo: Express.Multer.File; // โลโก้ธรรมดา

  logoActive: Express.Multer.File; // โลโก้ active
}
export class UploadBrandDto {
  id: number; // ID ของหมวดหมู่
}

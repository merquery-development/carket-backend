import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsDecimal,
  IsInt,
  IsJSON,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

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
export class UpdateCarDto extends PartialType(CreateCarDto) {}

export class CreateCarPostDto {
  @IsInt()
  carId: number;

  @IsInt()
  vendorId: number;

  @IsDecimal()
  price: number;

  @IsInt()
  year: number;

  @IsInt()
  mileage: number; // New field for mileage

  @IsJSON()
  @IsOptional()
  overrideSpecification?: string;

  @IsBoolean()
  isDiscount: boolean;

  @IsInt()
  viewCount: number;

  @IsDecimal()
  @IsOptional()
  preDiscountPrice?: number;
}

export class UpdateCarPostDto {
  @IsInt()
  @IsOptional()
  carId?: number;

  @IsInt()
  @IsOptional()
  vendorId?: number;

  @IsDecimal()
  @IsOptional()
  price?: number;

  @IsInt()
  @IsOptional()
  year?: number;

  @IsInt()
  @IsOptional()
  mileage?: number;

  @IsJSON()
  @IsOptional()
  overrideSpecification?: string;

  @IsBoolean()
  @IsOptional()
  isDiscount?: boolean;

  @IsDecimal()
  @IsOptional()
  preDiscountPrice?: number;

  @IsDateString()
  @IsOptional()
  deletedAt?: string;
}
export class createBrandDto{
  name
}

export class createCategoryDto{

}
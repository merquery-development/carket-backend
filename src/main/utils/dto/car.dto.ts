import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

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
  @ApiProperty({
    example: 1,
  })
  @IsInt()
  @Min(0) // Ensures carId is not less than 0
  carId: number;


  @ApiProperty({
    example: 25000.99,
  })
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0) // Ensures price is not less than 0
  price: number;

  @ApiProperty({
    example: 2022,
  })
  @IsInt()
  @Min(0) // Ensures year is not less than 0
  year: number;

  @ApiProperty({
    example: 15000,
  })
  @IsInt()
  @Min(0) // Ensures mileage is not less than 0
  mileage: number;

  @ApiProperty({
    example: '{"color": "red", "engine": "v6"}',
  })
  @IsJSON()
  @IsOptional()
  overrideSpecification?: string;

  @ApiProperty({
    example: false,
  })
  @IsBoolean()
  isDiscount: boolean;

  @ApiProperty({
    example: 27000.0,
  })
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @IsOptional()
  @Min(0) // Ensures preDiscountPrice is not less than 0
  preDiscountPrice?: number;
}

export class UpdateCarPostDto extends PartialType(CreateCarPostDto) {}

export class CreateCarpostPicDto {
  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value), { toClassOnly: true }) // Correct usage of Transform
  carId: number;

  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value), { toClassOnly: true }) // Correct usage of Transform
  vendorId: number;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value), { toClassOnly: true }) // Correct usage of Transform
  price: number;

  @IsInt()
  @Min(1900) // ตรวจสอบว่า year ต้องไม่น้อยกว่า 1900
  @Transform(({ value }) => Number(value), { toClassOnly: true }) // Correct usage of Transform
  year: number;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => Number(value), { toClassOnly: true }) // Correct usage of Transform
  mileage: number;

  @IsJSON()
  @IsOptional()
  overrideSpecification?: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true', { toClassOnly: true }) // Correct usage of Transform for boolean
  isDiscount: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value), { toClassOnly: true }) // Correct usage of Transform for preDiscountPrices
  preDiscountPrice?: number;
}

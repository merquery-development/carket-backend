import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
export class CreateVendorUserDto {
  @IsNumber()
  @IsOptional() // ไม่จำเป็นต้องใส่ vendorId หากเป็น OAuth
  @ApiProperty({
    example: '1',
    required: false,
  })
  vendorId: number;

  @IsString()
  @IsOptional() // username ไม่จำเป็นหากเป็น OAuth
  @ApiProperty({
    example: 'testuser',
    required: false,
  })
  username: string;
  @IsString()
  @IsOptional() // username ไม่จำเป็นหากเป็น OAuth
  @ApiProperty({
    example: 'Surapong',
    required: false,
  })
  firstname: string;
  @IsString()
  @IsOptional() // username ไม่จำเป็นหากเป็น OAuth
  @ApiProperty({
    example: 'Chamalai',
    required: false,
  })
  lastname: string;
  @IsEmail()
  @IsOptional() // email ไม่จำเป็นหากเป็น OAuth
  @ApiProperty({
    example: 'testemail@mail.com',
    required: false,
  })
  email: string;

  @IsString()
  @IsOptional() // password ไม่จำเป็นหากเป็น OAuth
  @ApiProperty({
    example: 'testpassword',
    required: false,
  })
  password: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    example: '1',
  })
  roleId: number;
}
export class UploadVendorBannerDto {
  @IsNotEmpty()
  vendorId: string;
}

export class CreateVendorDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'testvendor',
  })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'testemal@email.com',
  })
  email: string;

  @IsPhoneNumber('TH')
  @IsNotEmpty()
  @ApiProperty({
    example: '+6601234578',
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '123/456 midtown',
  })
  address: string;
}

export class UpdateVendorDto extends PartialType(CreateVendorDto){

}

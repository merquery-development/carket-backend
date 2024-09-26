import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
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
  @IsNotEmpty()
  @ApiProperty({
    example: '1',
  })
  roleId: number;

  @IsBoolean()
  @IsOptional() // บ่งบอกว่าเป็นผู้ใช้ OAuth หรือไม่
  @ApiProperty({
    example: false,
    required: false,
  })
  isOauth: boolean;

  @IsString()
  @IsOptional() // เก็บประเภทของ OAuth เช่น Google, Facebook
  @ApiProperty({
    example: 'Google',
    required: false,
  })
  oauthType: string;

  @IsOptional() // ข้อมูลที่ได้รับจาก OAuth provider เก็บในรูปแบบ JSON
  @ApiProperty({
    example: '{}',
    required: false,
  })
  oauthUserData: object;

  @IsDate()
  @IsOptional()
  @ApiProperty({
    example: new Date(),
    required: false,
  })
  updateAt: Date;
}
